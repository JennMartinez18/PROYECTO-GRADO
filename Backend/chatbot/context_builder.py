"""
Context builder — merges retrieved knowledge chunks into a single
context block ready to be injected into the LLM prompt.

Handles:
  - Deduplication of overlapping chunks.
  - Section grouping for readability.
  - Max context length enforcement.

Usage:
    from chatbot.context_builder import build_context

    context_text = build_context(chunks, max_length=4000)
"""
import logging
from typing import List

from django.conf import settings

from .models import KnowledgeChunk

logger = logging.getLogger(__name__)

# Default maximum context length in characters
DEFAULT_MAX_CONTEXT_LENGTH = 6000


def build_context(
    chunks: List[KnowledgeChunk],
    max_length: int | None = None,
) -> str:
    """
    Merge retrieved chunks into a structured context string.

    Chunks are grouped by section and presented in order of relevance.
    The total output is truncated at *max_length* characters to stay
    within LLM token limits.

    Args:
        chunks: List of KnowledgeChunk objects (from retriever).
        max_length: Maximum character length of the output.

    Returns:
        A formatted context string, or empty string if no chunks.
    """
    if not chunks:
        return ""

    max_length = max_length or getattr(settings, "RAG_MAX_CONTEXT_LENGTH", DEFAULT_MAX_CONTEXT_LENGTH)

    # Group chunks by section to avoid mixing unrelated topics
    seen_uuids: set = set()
    sections: dict[str, list[str]] = {}

    for chunk in chunks:
        # Deduplicate
        if chunk.uuid in seen_uuids:
            continue
        seen_uuids.add(chunk.uuid)

        section = chunk.section or "General"
        sections.setdefault(section, []).append(chunk.content.strip())

    # Build context with section headers
    parts: list[str] = []
    current_length = 0

    for section_name, contents in sections.items():
        header = f"\n--- {section_name} ---\n"
        if current_length + len(header) > max_length:
            break
        parts.append(header)
        current_length += len(header)

        for content in contents:
            if current_length + len(content) + 2 > max_length:
                # Add truncated remainder
                remaining = max_length - current_length - 5
                if remaining > 50:
                    parts.append(content[:remaining] + "...")
                break
            parts.append(content)
            parts.append("")  # blank line separator
            current_length += len(content) + 1

    context = "\n".join(parts).strip()

    logger.info(
        "Built context from %d chunks (%d sections, %d chars)",
        len(chunks), len(sections), len(context),
    )
    return context


def build_context_with_metadata(
    chunks: List[KnowledgeChunk],
    max_length: int | None = None,
) -> dict:
    """
    Build context and return both the text and metadata about which
    chunks were used (for analytics tracking).

    Returns:
        dict with keys:
            - ``context``: The formatted context string.
            - ``chunk_uuids``: List of UUIDs used.
            - ``sections``: List of section names.
            - ``total_chunks``: Number of unique chunks.
    """
    if not chunks:
        return {"context": "", "chunk_uuids": [], "sections": [], "total_chunks": 0}

    context = build_context(chunks, max_length)

    chunk_uuids = [str(c.uuid) for c in chunks]
    section_names = list({c.section or "General" for c in chunks})

    return {
        "context": context,
        "chunk_uuids": chunk_uuids,
        "sections": section_names,
        "total_chunks": len(chunk_uuids),
    }
