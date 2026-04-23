"""
Admin configuration for Chatbot: RAG knowledge base + conversation analytics.

Features:
  - Knowledge Document / Chunk management (ingestion, search, preview).
  - View all sessions with message count, IP, user agent and dates.
  - Inline view of all messages within a session.
  - Filter sessions by date range.
  - Search messages by content.
  - All analytics records are read-only.
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import ChatMessage, ChatSession, KnowledgeChunk, KnowledgeDocument


# ══════════════════════════════════════════════════════════════════════════════
# RAG Knowledge Base
# ══════════════════════════════════════════════════════════════════════════════

class KnowledgeChunkInline(admin.TabularInline):
    model = KnowledgeChunk
    extra = 0
    readonly_fields = ('uuid', 'section', 'content_preview', 'metadata', 'created_at')
    fields          = ('uuid', 'section', 'content_preview', 'metadata', 'created_at')
    can_delete      = True
    show_change_link = True
    ordering        = ('created_at',)

    @admin.display(description='Content')
    def content_preview(self, obj):
        return obj.content[:120].replace('\n', ' ') + '…' if len(obj.content) > 120 else obj.content

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display    = ('title', 'source', 'chunk_count', 'created_at')
    list_filter     = ('created_at',)
    search_fields   = ('title', 'source')
    readonly_fields = ('uuid', 'created_at', 'chunk_count')
    ordering        = ('-created_at',)
    inlines         = [KnowledgeChunkInline]

    @admin.display(description='Chunks')
    def chunk_count(self, obj):
        return obj.chunks.count()


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display    = ('section', 'document_title', 'content_preview', 'created_at')
    list_filter     = ('section', 'document__title', 'created_at')
    search_fields   = ('content', 'section', 'document__title')
    readonly_fields = ('uuid', 'document', 'content', 'section', 'metadata', 'created_at')
    ordering        = ('document', 'created_at')

    def has_add_permission(self, request):
        return False

    @admin.display(description='Document')
    def document_title(self, obj):
        return obj.document.title

    @admin.display(description='Content')
    def content_preview(self, obj):
        return obj.content[:120].replace('\n', ' ') + '…' if len(obj.content) > 120 else obj.content


# ══════════════════════════════════════════════════════════════════════════════
# Conversation Analytics
# ══════════════════════════════════════════════════════════════════════════════

# ── ChatMessage inline ────────────────────────────────────────────────────────

class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields  = ('created_at', 'user_message', 'bot_response', 'response_time_ms')
    fields           = ('created_at', 'user_message', 'bot_response', 'response_time_ms')
    can_delete       = False
    show_change_link = False
    ordering         = ('created_at',)

    def has_add_permission(self, request, obj=None):
        return False


# ── ChatSession admin ─────────────────────────────────────────────────────────

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display  = (
        'short_session_id', 'ip_address', 'total_messages',
        'created_at', 'updated_at', 'agent_preview',
    )
    list_filter   = ('created_at', 'updated_at')
    search_fields = ('session_id', 'ip_address', 'user_agent')
    readonly_fields = (
        'session_id', 'ip_address', 'user_agent',
        'created_at', 'updated_at', 'total_messages',
    )
    ordering  = ('-created_at',)
    inlines   = [ChatMessageInline]
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='Session ID')
    def short_session_id(self, obj):
        return str(obj.session_id)[:8].upper() + '...'

    @admin.display(description='User Agent')
    def agent_preview(self, obj):
        return obj.user_agent[:80] if obj.user_agent else '—'


# ── ChatMessage admin ─────────────────────────────────────────────────────────

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = (
        'created_at', 'session_link', 'ip_address',
        'question_preview', 'answer_preview', 'response_time_ms',
    )
    list_filter   = ('created_at',)
    search_fields = ('user_message', 'bot_response', 'session__ip_address')
    readonly_fields = (
        'session', 'user_message', 'bot_response',
        'response_time_ms', 'created_at',
    )
    ordering       = ('-created_at',)
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='Session')
    def session_link(self, obj):
        url = f'/config/admin/chatbot/chatsession/{obj.session.pk}/change/'
        label = str(obj.session.session_id)[:8].upper()
        return format_html('<a href="{}">{}</a>', url, label)

    @admin.display(description='IP')
    def ip_address(self, obj):
        return obj.session.ip_address or '—'

    @admin.display(description='Question')
    def question_preview(self, obj):
        return obj.user_message[:100]

    @admin.display(description='Answer')
    def answer_preview(self, obj):
        return obj.bot_response[:100]
