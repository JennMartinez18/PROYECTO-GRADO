"""
Embedding generation using Google's gemini-embedding-001 model.

This module provides functions to generate vector embeddings from text
using the Google Generative AI API. Embeddings are 768-dimensional
vectors (truncated from 3072) used for semantic similarity search in pgvector.

Usage:
    from chatbot.embeddings import get_embedding, get_embeddings_batch

    vector = get_embedding("What products does ESWindows offer?")
    vectors = get_embeddings_batch(["chunk 1 text", "chunk 2 text"])
"""
import logging
from functools import lru_cache
from typing import List

import google.generativeai as genai
from django.conf import settings

from .exceptions import GeminiConfigError

logger = logging.getLogger(__name__)

# gemini-embedding-001 produces 3072-dim vectors by default; we truncate
# to 768 via output_dimensionality.  MUST match KnowledgeChunk.EMBEDDING_DIMENSIONS.
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


def _ensure_configured() -> None:
    """Configure the Generative AI client if not already done."""
    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        raise GeminiConfigError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=api_key)


def get_embedding(text: str) -> List[float]:
    """
    Generate an embedding vector for a single text string.

    Args:
        text: The text to embed. Will be truncated to 2048 chars.

    Returns:
        A list of 768 floats representing the embedding vector.

    Raises:
        GeminiConfigError: If the API key is not set.
        GeminiAPIError: If the API call fails.
    """
    _ensure_configured()
    text = text[:2048].strip()
    if not text:
        return [0.0] * EMBEDDING_DIMENSIONS

    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_document",
        output_dimensionality=EMBEDDING_DIMENSIONS,
    )
    return result["embedding"]


def get_query_embedding(text: str) -> List[float]:
    """
    Generate an embedding optimised for *query* (retrieval_query task).

    Uses ``retrieval_query`` task type which yields better results when
    finding documents that match a user question.

    Args:
        text: The user query to embed.

    Returns:
        A list of 768 floats.
    """
    _ensure_configured()
    text = text[:2048].strip()
    if not text:
        return [0.0] * EMBEDDING_DIMENSIONS

    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
        output_dimensionality=EMBEDDING_DIMENSIONS,
    )
    return result["embedding"]


def get_embeddings_batch(texts: List[str], batch_size: int = 100) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batches.

    The Google API supports batching natively. This function handles
    chunking into batches of *batch_size* to stay within API limits.

    Args:
        texts: List of text strings to embed.
        batch_size: Max texts per API call (default 100).

    Returns:
        A list of embedding vectors (same order as input).
    """
    _ensure_configured()
    all_embeddings: List[List[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = [t[:2048].strip() or " " for t in texts[i : i + batch_size]]
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=batch,
            task_type="retrieval_document",
            output_dimensionality=EMBEDDING_DIMENSIONS,
        )
        all_embeddings.extend(result["embedding"])
        logger.info("Embedded batch %d–%d of %d", i + 1, i + len(batch), len(texts))

    return all_embeddings
