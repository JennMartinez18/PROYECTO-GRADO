"""
Gemini Chatbot Service — stateless chat with context injection.

Registration:
  In settings.py add:
    CHATBOT_CONTEXT_PATH = BASE_DIR / 'context_gemini' / 'bot_becomedelaer.txt'
"""
import logging
import re
from pathlib import Path

import google.generativeai as genai
from django.conf import settings
from .exceptions import ContextFileNotFoundError, GeminiAPIError, GeminiConfigError

logger = logging.getLogger(__name__)


class GeminiChatbotService:
    """
    Stateless wrapper around the Gemini ``gemini-1.5-flash`` model.

    Each call to ``get_response`` creates a fresh chat session with the
    supplied history so no server-side state is needed.
    """

    MODEL_NAME = "gemini-2.5-flash"

    # ------------------------------------------------------------------ #
    #  Initialisation                                                     #
    # ------------------------------------------------------------------ #

    def __init__(self, context_path: str | Path):
        """
        Args:
            context_path: absolute path to the context ``.txt`` file that
                          will be injected into the system prompt.

        Raises:
            ContextFileNotFoundError: if *context_path* does not exist.
            GeminiConfigError: if ``GEMINI_API_KEY`` is not set.
        """
        # Load context file
        context_path = Path(context_path)
        if not context_path.is_file():
            raise ContextFileNotFoundError(str(context_path))

        self._context = context_path.read_text(encoding="utf-8")

        # Configure Gemini client
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise GeminiConfigError()

        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(
            model_name=self.MODEL_NAME,
            system_instruction=self.build_system_prompt(),
        )

    # ------------------------------------------------------------------ #
    #  System prompt                                                      #
    # ------------------------------------------------------------------ #

    def build_system_prompt(self) -> str:
        """Return the system prompt with the loaded context injected."""
        return (
            "You are a helpful assistant that answers questions based "
            "exclusively on the following context. If the answer cannot be "
            "found in the context, say so clearly. "
            "You must ALWAYS respond in English, regardless of the language "
            "the user writes in.\n\n"
            "--- CONTEXT START ---\n"
            f"{self._context}\n"
            "--- CONTEXT END ---"
        )

    # ------------------------------------------------------------------ #
    #  Chat                                                               #
    # ------------------------------------------------------------------ #

    def get_response(self, user_message: str, history: list | None = None) -> str:
        """
        Send *user_message* to Gemini and return the model's text reply.

        Args:
            user_message: the current user message.
            history: prior conversation turns as a list of dicts::

                [{"role": "user", "parts": "..."}, {"role": "model", "parts": "..."}]

        Returns:
            The model's plain-text response.

        Raises:
            GeminiAPIError: on any upstream API failure.
        """
        try:
            # Normalise history entries to the format Gemini expects
            chat_history = []
            for entry in (history or []):
                chat_history.append({
                    "role": entry.get("role", "user"),
                    "parts": [entry["parts"]] if isinstance(entry.get("parts"), str) else entry.get("parts", []),
                })

            chat = self._model.start_chat(history=chat_history)
            response = chat.send_message(user_message)
            return self._strip_markdown(response.text)

        except Exception as exc:
            logger.exception("Gemini API error")
            raise GeminiAPIError(detail=str(exc)) from exc

    # ------------------------------------------------------------------ #

    @staticmethod
    def _strip_markdown(text: str) -> str:
        """Remove markdown symbols (asterisks, hashes, backticks) while keeping line breaks."""
        # Remove bold/italic: ***text***, **text**, *text*
        text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
        # Remove inline code: `text`
        text = re.sub(r'`([^`]*)`', r'\1', text)
        # Remove markdown headers: ## Title -> Title
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        # Remove remaining lone asterisks or hashes
        text = re.sub(r'(?<!\S)[*#]+(?!\S)', '', text)
        return text.strip()
