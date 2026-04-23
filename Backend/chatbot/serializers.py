"""
Serializers for the RAG-powered Gemini Chatbot module.
"""
from rest_framework import serializers

class RAGChatMessageSerializer(serializers.Serializer):
    """
    Incoming RAG chat request.

    The server manages conversation history via ``session_id`` — the client
    only needs to send a message and (optionally) the session ID returned
    from the previous response.
    """

    session_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        default=None,
        help_text='Session ID from a previous response. Omit or null to start a new session.',
    )
    message = serializers.CharField(
        required=True,
        max_length=1000,
        min_length=1,
        help_text='The user message to send to the RAG-powered assistant. Max 1000 characters.',
    )


class RAGChatResponseSerializer(serializers.Serializer):
    """
    Outgoing RAG chat response.

    Includes the AI reply, session information, and metadata about
    the knowledge chunks that were retrieved for context.
    """

    session_id = serializers.UUIDField(
        help_text='Session identifier. Pass this in every subsequent request.',
    )
    response = serializers.CharField(
        help_text="The AI model's reply, grounded on knowledge-base context.",
    )
    chunks_used = serializers.ListField(
        child=serializers.UUIDField(),
        help_text='UUIDs of the knowledge chunks used to generate the answer.',
    )
    sections_used = serializers.ListField(
        child=serializers.CharField(),
        help_text='Section titles from the knowledge base that contributed to the answer.',
    )
    response_time_ms = serializers.IntegerField(
        help_text='Time in milliseconds to generate the response.',
    )
