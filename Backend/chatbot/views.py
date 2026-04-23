"""
Views for the RAG-powered Gemini Chatbot module.

Endpoint:
  POST /api/chatbot/rag/chat/ — RAG-powered chatbot (vector search + Gemini)

Registration:
  In root urls.py add:
    path('api/chatbot/', include('chatbot.urls'))
"""
import html
import logging
import re

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

"""
Views for the RAG-powered Gemini Chatbot module.

Endpoint:
  POST /api/chatbot/rag/chat/ — RAG-powered chatbot (vector search + Gemini)

Registration:
  In root urls.py add:
    path('api/chatbot/', include('chatbot.urls'))
"""
import html
import logging
import re

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .exceptions import ChatbotError
from .serializers import RAGChatMessageSerializer, RAGChatResponseSerializer
from .throttles import ChatbotBurstThrottle, ChatbotSustainedThrottle, ChatbotDailyThrottle

logger = logging.getLogger(__name__)

# ── Request/Response schemas for Swagger ──────────────────────────────────────

_response_400_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'message': openapi.Schema(type=openapi.TYPE_STRING, example='This field is required.'),
    },
)

_response_503_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'error': openapi.Schema(
            type=openapi.TYPE_STRING,
            example='The chatbot service is currently disabled.',
        ),
    },
)

_rag_request_body_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['message'],
    properties={
        'session_id': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='uuid',
            description='Session ID returned from a previous response. Omit to start a new session.',
            example='a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        ),
        'message': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='The current user message to send to the RAG chatbot.',
            example='What are the requirements to become a dealer?',
        ),
    },
    example={
        'message': 'What are the requirements to become a dealer?',
    },
)

_rag_response_200_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'session_id': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='uuid',
            description='Session identifier. Send this in every subsequent request.',
            example='a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        ),
        'response': openapi.Schema(
            type=openapi.TYPE_STRING,
            description="The AI model's answer grounded on knowledge-base context.",
            example='To become a dealer you must meet the following requirements: ...',
        ),
        'chunks_used': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING, format='uuid'),
            description='UUIDs of the knowledge chunks used for context.',
        ),
        'sections_used': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_STRING),
            description='Section titles from the knowledge base.',
        ),
        'response_time_ms': openapi.Schema(
            type=openapi.TYPE_INTEGER,
            description='Time in ms to generate the response.',
        ),
    },
)


class RAGChatbotView(APIView):
    """
    RAG-powered Gemini chatbot — retrieves relevant knowledge chunks
    via pgvector similarity search and generates a grounded answer.

    **Conversation history is managed server-side**. The client only
    needs to send the ``session_id`` returned from the first response
    to continue the conversation.

    No authentication required — the endpoint is public (AllowAny).
    Rate-limited per IP: 5/min · 30/hour · 100/day.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ChatbotBurstThrottle, ChatbotSustainedThrottle, ChatbotDailyThrottle]

    _TAG_RE = re.compile(r'<[^>]+>')

    def _sanitize(self, text: str) -> str:
        """Remove HTML tags and collapse whitespace."""
        text = self._TAG_RE.sub('', text)
        text = html.unescape(text)
        text = ' '.join(text.split())
        return text[:1000]

    @swagger_auto_schema(
        operation_id='rag_chatbot_chat',
        operation_summary='Send a message to the RAG-powered AI assistant',
        operation_description=(
            "## RAG Chatbot — Knowledge-Grounded Conversation\n\n"
            "Sends a user message to the Gemini model. The server:\n"
            "1. Generates an embedding for the query.\n"
            "2. Retrieves the most relevant knowledge chunks via pgvector cosine similarity.\n"
            "3. Builds a grounded system prompt with the retrieved context.\n"
            "4. Sends the prompt + conversation history to Gemini.\n"
            "5. Persists the exchange and returns the response.\n\n"
            "### Session management\n"
            "History is **server-managed**. Send `session_id` from the previous response "
            "to continue the conversation, or omit it to start fresh.\n\n"
            "### Error codes\n"
            "| Code | Cause |\n"
            "|------|-------|\n"
            "| 400  | `message` field missing or invalid |\n"
            "| 429  | Rate limit exceeded |\n"
            "| 503  | Service disabled, API key missing, or knowledge base empty |\n"
        ),
        request_body=_rag_request_body_schema,
        responses={
            200: openapi.Response(
                description='RAG-powered model reply with metadata.',
                schema=_rag_response_200_schema,
            ),
            400: openapi.Response(
                description='Validation error.',
                schema=_response_400_schema,
            ),
            503: openapi.Response(
                description='Service unavailable.',
                schema=_response_503_schema,
            ),
        },
        tags=['Chatbot RAG'],
    )
    def post(self, request):
        # ── Feature flag ─────────────────────────────────────────
        if settings.CHATBOT_ENABLED is False:
            return Response(
                {'error': 'The chatbot service is currently disabled.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serializer = RAGChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_message = self._sanitize(serializer.validated_data["message"])
        session_id   = serializer.validated_data.get("session_id")

        # ── Call RAG pipeline ─────────────────────────────────────
        try:
            from .rag_service import ask_question

            ip         = self._get_client_ip(request)
            user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

            result = ask_question(
                question=user_message,
                session_id=session_id,
                ip_address=ip,
                user_agent=user_agent,
            )
        except Exception as exc:
            logger.exception("RAG chatbot error")
            return Response(
                {"error": f"Chatbot service error: {exc}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            RAGChatResponseSerializer(result).data,
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def _get_client_ip(request) -> str:
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded:
            return x_forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
