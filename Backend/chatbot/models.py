"""
Chatbot models — RAG knowledge base + conversation analytics.

KnowledgeDocument  — one ingested source document.
KnowledgeChunk     — one semantic chunk with pgvector embedding.
ChatSession        — one conversation session per browser/device.
ChatMessage        — one row per exchange (user question + bot answer).
"""
import uuid

from django.db import models
from pgvector.django import VectorField


# ── RAG Knowledge Base ────────────────────────────────────────────────────────

class KnowledgeDocument(models.Model):
    """
    Represents a source document that has been ingested into the
    knowledge base. Chunks are created from this document.
    """
    uuid       = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    title      = models.CharField(max_length=255, help_text='Human-readable document title')
    source     = models.CharField(max_length=500, blank=True, default='', help_text='File path or URL')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name        = 'Knowledge Document'
        verbose_name_plural = 'Knowledge Documents'

    def __str__(self) -> str:
        return f"{self.title} ({self.chunks.count()} chunks)"


class KnowledgeChunk(models.Model):
    """
    A semantic chunk of text extracted from a KnowledgeDocument,
    stored with its pgvector embedding for similarity search.

    The ``embedding`` field uses pgvector's VectorField with 768
    dimensions.
    """
    EMBEDDING_DIMENSIONS = 768

    uuid       = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    document   = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name='chunks')
    content    = models.TextField(help_text='The raw text content of this chunk')
    section    = models.CharField(max_length=255, blank=True, default='', help_text='Section header this chunk belongs to')
    metadata   = models.JSONField(default=dict, blank=True, help_text='Arbitrary metadata (chunk index, source line, etc.)')
    embedding  = VectorField(dimensions=EMBEDDING_DIMENSIONS)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name        = 'Knowledge Chunk'
        verbose_name_plural = 'Knowledge Chunks'

    def __str__(self) -> str:
        preview = self.content[:80].replace('\n', ' ')
        return f"[{self.section or 'no-section'}] {preview}…"


# ── Conversation Analytics ────────────────────────────────────────────────────

class ChatSession(models.Model):
    """
    Tracks one complete conversation session.
    Created on the first message, reused on subsequent messages via session_id.
    """
    session_id     = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    ip_address     = models.GenericIPAddressField(null=True, blank=True)
    user_agent     = models.TextField(blank=True, default='')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)
    total_messages = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        verbose_name        = 'Chat Session'
        verbose_name_plural = 'Chat Sessions'

    def __str__(self) -> str:
        return f"Session {str(self.session_id)[:8]} — {self.total_messages} msgs ({self.created_at.date()})"


class ChatMessage(models.Model):
    """
    Stores each user question and the bot's response within a session.
    Includes the chunks that were retrieved for RAG context.
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    session          = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role             = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    content          = models.TextField(blank=True, default='', help_text='Message content')
    user_message     = models.TextField(blank=True, default='', help_text='(legacy) User question text')
    bot_response     = models.TextField(blank=True, default='', help_text='(legacy) Bot answer text')
    chunks_used      = models.JSONField(default=list, blank=True, help_text='UUIDs of KnowledgeChunks used for this response')
    response_time_ms = models.PositiveIntegerField(null=True, blank=True, help_text='Time in ms to get Gemini response')
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name        = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self) -> str:
        preview = self.content[:60] or self.user_message[:60]
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {preview}"
