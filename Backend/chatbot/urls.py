"""
URL configuration for the RAG-powered Gemini Chatbot module.

Endpoint:
  POST /api/chatbot/rag/chat/ — RAG-powered chatbot (vector search + Gemini)

Registration:
  In root urls.py add:
    path('api/chatbot/', include('chatbot.urls'))
"""
from django.urls import path

from .views import RAGChatbotView

urlpatterns = [
    path("rag/chat/", RAGChatbotView.as_view(), name="chatbot-rag-chat"),
]
