"""
RAG service — orchestrates the full Retrieval-Augmented Generation pipeline.

Flow:
    1. Receive user question + session_id
    2. Retrieve relevant knowledge chunks (retriever)
    3. Build context from chunks (context_builder)
    4. Build system prompt with context (prompt_builder)
    5. Load conversation history (prompt_builder)
    6. Send to Gemini 2.5 Flash
    7. Persist messages to DB (analytics)
    8. Return the answer

Usage:
    from chatbot.rag_service import ask_question

    answer = ask_question("What products does ESWindows offer?", session_id="...")
"""
import logging
import re
import time
from typing import Optional
from uuid import UUID

import google.generativeai as genai
from django.conf import settings

from .context_builder import build_context_with_metadata
from .exceptions import GeminiAPIError, GeminiConfigError
from .models import ChatMessage, ChatSession
from .prompt_builder import build_chat_history, build_system_prompt
from .retriever import retrieve_chunks

logger = logging.getLogger(__name__)

# Gemini model for chat completions
RAG_MODEL_NAME = "gemini-2.5-flash"


class RAGService:
    """
    Production-ready RAG pipeline for the ESWindows knowledge base.

    Stateless: each call retrieves context and history from the DB,
    calls Gemini, persists the exchange, and returns the result.
    """

    def __init__(self):
        api_key = getattr(settings, "GEMINI_API_KEY", "")
        if not api_key:
            raise GeminiConfigError("GEMINI_API_KEY is not configured")
        genai.configure(api_key=api_key)

    def ask_question(
        self,
        question: str,
        session_id: Optional[str | UUID] = None,
        top_k: int | None = None,
        ip_address: str = "",
        user_agent: str = "",
    ) -> dict:
        """
        Full RAG pipeline: retrieve → build context → prompt → generate → persist.

        Args:
            question: The user's question.
            session_id: Existing session UUID (or None for a new session).
            top_k: Number of chunks to retrieve.
            ip_address: Client IP for analytics.
            user_agent: Client user-agent for analytics.

        Returns:
            dict with keys:
                - ``response``: The model's answer text.
                - ``session_id``: The session UUID (new or existing).
                - ``chunks_used``: List of chunk UUIDs used.
                - ``response_time_ms``: Time to generate the response.

        Raises:
            GeminiConfigError: If API key is not set.
            GeminiAPIError: If the Gemini API call fails.
        """
        t0 = time.monotonic()

        # ── Step 1: Retrieve relevant chunks ──────────────────────────
        chunks = retrieve_chunks(question, top_k=top_k)

        # ── Step 2: Build context ─────────────────────────────────────
        context_data = build_context_with_metadata(chunks)
        context_text = context_data["context"]

        # ── Step 3: Build system prompt ───────────────────────────────
        system_prompt = build_system_prompt(context_text)

        # ── Step 4: Load conversation history ─────────────────────────
        chat_history = build_chat_history(session_id)

        # ── Step 5: Call Gemini ───────────────────────────────────────
        try:
            model = genai.GenerativeModel(
                model_name=RAG_MODEL_NAME,
                system_instruction=system_prompt,
            )
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(question)
            answer = self._strip_markdown(response.text)
        except Exception as exc:
            logger.exception("RAG Gemini API error")
            raise GeminiAPIError(detail=str(exc)) from exc

        response_ms = int((time.monotonic() - t0) * 1000)

        # ── Step 6: Persist to DB ─────────────────────────────────────
        session = self._persist_exchange(
            session_id=session_id,
            user_message=question,
            bot_response=answer,
            chunk_uuids=context_data["chunk_uuids"],
            response_ms=response_ms,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        logger.info(
            "RAG response generated in %dms using %d chunks for session %s",
            response_ms, context_data["total_chunks"], session.session_id,
        )

        return {
            "response": answer,
            "session_id": str(session.session_id),
            "chunks_used": context_data["chunk_uuids"],
            "sections_used": context_data["sections"],
            "response_time_ms": response_ms,
        }

    # ── Private helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _persist_exchange(
        session_id: Optional[str | UUID],
        user_message: str,
        bot_response: str,
        chunk_uuids: list,
        response_ms: int,
        ip_address: str = "",
        user_agent: str = "",
    ) -> ChatSession:
        """Create or retrieve session and save both user + assistant messages."""
        try:
            if session_id:
                session, _ = ChatSession.objects.get_or_create(
                    session_id=session_id,
                    defaults={"ip_address": ip_address, "user_agent": user_agent},
                )
            else:
                session = ChatSession.objects.create(
                    ip_address=ip_address,
                    user_agent=user_agent,
                )

            # Save user message
            ChatMessage.objects.create(
                session=session,
                role="user",
                content=user_message,
                user_message=user_message,
            )

            # Save assistant message
            ChatMessage.objects.create(
                session=session,
                role="assistant",
                content=bot_response,
                bot_response=bot_response,
                chunks_used=chunk_uuids,
                response_time_ms=response_ms,
            )

            session.total_messages += 1
            session.save(update_fields=["total_messages", "updated_at"])

            return session

        except Exception:
            logger.exception("Failed to persist RAG exchange")
            # Return a dummy session so the response still works
            return ChatSession(session_id=session_id or "00000000-0000-0000-0000-000000000000")

    @staticmethod
    def _strip_markdown(text: str) -> str:
        """Remove markdown formatting while keeping line breaks."""
        text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
        text = re.sub(r'`([^`]*)`', r'\1', text)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'(?<!\S)[*#]+(?!\S)', '', text)
        return text.strip()


# ── Module-level convenience function ─────────────────────────────────────────

def ask_question(
    question: str,
    session_id: Optional[str | UUID] = None,
    top_k: int | None = None,
    ip_address: str = "",
    user_agent: str = "",
) -> dict:
    """
    Convenience wrapper around RAGService.ask_question().

    Usage:
        result = ask_question("What is ESWindows?")
        print(result["response"])
    """
    service = RAGService()
    return service.ask_question(
        question=question,
        session_id=session_id,
        top_k=top_k,
        ip_address=ip_address,
        user_agent=user_agent,
    )
