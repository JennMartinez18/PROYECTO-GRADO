# ─────────────────────────────────────────────────────────────────────────────
# Registration:
#   In settings.py → INSTALLED_APPS: 'chatbot'
# ─────────────────────────────────────────────────────────────────────────────
from django.apps import AppConfig


class ChatbotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chatbot'
    verbose_name = 'Gemini Chatbot'
