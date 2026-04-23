"""
Prompt builder — constructs the full prompt for the Gemini LLM.

Injects:
  1. System instructions with rules.
  2. Retrieved RAG context.
  3. Conversation history (last N turns).
  4. The current user question.

Usage:
    from chatbot.prompt_builder import build_system_prompt, build_chat_history

    system = build_system_prompt(context_text)
    history = build_chat_history(session_id, max_turns=10)
"""
import logging
from typing import List
from uuid import UUID

from django.conf import settings

from .models import ChatMessage

logger = logging.getLogger(__name__)

# Maximum number of conversation turns to include in context
DEFAULT_MAX_HISTORY_TURNS = 10

# ── System prompt template ───────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are ESWindows AI Assistant, a helpful and professional customer support agent for ESWindows.

GREETING RULE (highest priority):
- When the user sends a greeting (e.g. hello, hi, hey, hola, good morning, good afternoon, good evening, howdy, greetings, what's up, or any similar friendly opening), you MUST respond with a warm, professional greeting and ask how you can assist them today.
- Example greeting response: "Hello! Welcome to ESWindows. I'm your virtual assistant and I'm here to help you. How can I assist you today?"
- You may adapt the wording naturally, but always be warm, concise, and professional.
- This rule overrides the context rules below — no context is needed to respond to a greeting.

CONTACT RULE:
- If the user asks to speak with a person, contact someone at the company, reach a representative, or asks who can help them with something the bot cannot resolve, always provide this information:
  "You can contact our team directly at sdelapena@eswindows.com — they will be happy to assist you with any inquiry I was unable to resolve."
- This rule applies regardless of context availability.

INAPPROPRIATE REQUEST RULE:
- If the user sends an insult, offensive language, abusive message, or any inappropriate request, do NOT engage with the insult or respond in kind.
- Instead, respond cordially and professionally: "I'm sorry, but I cannot process that request. I apologize for not being able to help you with that. If you have any questions about ESWindows products or services, I'd be happy to assist."
- Keep your tone respectful and professional at all times.

STRICT RULES (apply to all non-greeting messages):
1. You may ONLY answer using the context provided below.
2. You must NOT invent information or make assumptions.
3. If the answer cannot be found in the context, respond EXACTLY: "I do not have information on that topic in the ESWindows knowledge base."
4. You must ONLY answer about ESWindows.
5. You must NOT answer questions about other companies, even if they are related.
6. You must NOT generate opinions, only factual information from the context.
7. If a question mentions another company, indicate that you can only answer about ESWindows.
8. You must ALWAYS respond in English, regardless of the language the user writes in.
9. Keep your responses concise, clear, and professional.
10. Do NOT use markdown formatting (no asterisks, no hashes, no backticks).

--- CONTEXT START ---
{context}
--- CONTEXT END ---
"""


def build_system_prompt(context: str) -> str:
    """
    Build the system instruction prompt with the retrieved context.

    Args:
        context: The merged RAG context text from build_context().

    Returns:
        A fully formatted system prompt string.
    """
    if not context:
        context = "(No relevant context was found for this question.)"

    return SYSTEM_PROMPT_TEMPLATE.format(context=context)


def build_chat_history(
    session_id: UUID | str | None,
    max_turns: int | None = None,
) -> List[dict]:
    """
    Retrieve the last *max_turns* conversation exchanges from the
    database and format them for Gemini's chat history.

    Args:
        session_id: The ChatSession.session_id UUID.
        max_turns: Number of recent message pairs to include.

    Returns:
        A list of dicts: [{"role": "user", "parts": [...]}, ...]
    """
    if not session_id:
        return []

    max_turns = max_turns or getattr(settings, "RAG_MAX_HISTORY_TURNS", DEFAULT_MAX_HISTORY_TURNS)

    messages = (
        ChatMessage.objects
        .filter(session__session_id=session_id)
        .order_by("-created_at")[: max_turns * 2]  # 2 messages per turn (user + assistant)
    )

    # Reverse to chronological order
    messages = list(reversed(messages))

    history: List[dict] = []
    for msg in messages:
        gemini_role = "user" if msg.role == "user" else "model"
        content = msg.content or msg.user_message or ""
        if content.strip():
            history.append({
                "role": gemini_role,
                "parts": [content],
            })

    logger.debug("Built chat history with %d turns for session %s", len(history), session_id)
    return history
