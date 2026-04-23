"""
Vector retriever — semantic search over KnowledgeChunk embeddings.

Uses pgvector's cosine distance operator to find the most relevant
chunks for a given user query.

Usage:
    from chatbot.retriever import retrieve_chunks

    chunks = retrieve_chunks("What products does ESWindows offer?", top_k=5)
    for chunk in chunks:
        print(chunk.section, chunk.content[:100])
"""
import logging
from typing import List

from django.conf import settings

from .embeddings import get_query_embedding
from .models import KnowledgeChunk

logger = logging.getLogger(__name__)

# Default number of chunks to retrieve
DEFAULT_TOP_K = 5


def retrieve_chunks(
    query: str,
    top_k: int | None = None,
    min_score: float = 0.0,
) -> List[KnowledgeChunk]:
    """
    Convert *query* to an embedding and return the top-K most similar
    knowledge chunks using pgvector cosine distance.

    Args:
        query: The user's question or search string.
        top_k: Number of chunks to return (default from settings or 5).
        min_score: Minimum cosine similarity threshold (0.0–1.0).
                   Chunks below this score are excluded.

    Returns:
        A list of KnowledgeChunk instances ordered by similarity
        (most relevant first). Each instance has an extra
        ``similarity_score`` attribute attached.
    """
    top_k = top_k or getattr(settings, "RAG_TOP_K", DEFAULT_TOP_K)

    query_embedding = get_query_embedding(query)

    # pgvector cosine distance: smaller = more similar
    # We order by cosine_distance ASC and convert to similarity = 1 - distance
    chunks = (
        KnowledgeChunk.objects
        .annotate(
            distance=CosineDistance("embedding", query_embedding),
        )
        .order_by("distance")[:top_k]
    )

    results: List[KnowledgeChunk] = []
    for chunk in chunks:
        similarity = 1.0 - (chunk.distance or 0.0)
        if similarity >= min_score:
            chunk.similarity_score = similarity
            results.append(chunk)

    logger.info(
        "Retrieved %d chunks for query (top_k=%d, min_score=%.2f): %s",
        len(results), top_k, min_score, query[:80],
    )
    return results


# ── pgvector cosine distance expression ──────────────────────────────────────

from django.db.models import Func, FloatField  # noqa: E402


class CosineDistance(Func):
    """
    PostgreSQL expression:  embedding <=> %(query_vector)s

    pgvector's ``<=>`` operator returns the cosine distance (0 = identical,
    2 = opposite). We wrap it as a Django Func so it can be used in
    ``.annotate()`` and ``.order_by()``.
    """
    function = ""
    template = "(%(expressions)s <=> '%(vector)s')"
    output_field = FloatField()

    def __init__(self, column: str, vector: list, **kwargs):
        from django.db.models import F
        self.vector = vector
        super().__init__(F(column), **kwargs)

    def as_sql(self, compiler, connection, **extra_context):
        # Format vector as pgvector literal: [0.1, 0.2, ...]
        vec_str = "[" + ",".join(str(v) for v in self.vector) + "]"
        lhs, lhs_params = compiler.compile(self.source_expressions[0])
        sql = f"({lhs} <=> '{vec_str}'::vector)"
        return sql, lhs_params
