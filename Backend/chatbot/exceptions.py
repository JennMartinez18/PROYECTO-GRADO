"""
Custom exceptions for the Gemini Chatbot module.
"""


class ChatbotError(Exception):
    """Base exception for the chatbot module."""


class ContextFileNotFoundError(ChatbotError):
    """Raised when the context file cannot be found."""

    def __init__(self, path: str):
        self.path = path
        super().__init__(f"Context file not found: {path}")


class GeminiAPIError(ChatbotError):
    """Raised when the Gemini API returns an error."""

    def __init__(self, detail: str = "Gemini API error"):
        self.detail = detail
        super().__init__(detail)


class GeminiConfigError(ChatbotError):
    """Raised when GEMINI_API_KEY is missing or invalid."""

    def __init__(self, detail: str = "GEMINI_API_KEY is not configured"):
        self.detail = detail
        super().__init__(detail)
