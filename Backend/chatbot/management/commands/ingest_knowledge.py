"""
Django management command: ingest_knowledge

Loads a knowledge-base text document, splits it into semantic chunks,
generates embeddings via text-embedding-004, and stores everything in
the database for RAG retrieval.

Usage:
    python manage.py ingest_knowledge
    python manage.py ingest_knowledge --file /path/to/custom.txt --title "My KB"
    python manage.py ingest_knowledge --chunk-size 500 --chunk-overlap 50 --clear
"""
import logging
import re
from pathlib import Path
from typing import List, Tuple

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from chatbot.embeddings import get_embeddings_batch
from chatbot.models import KnowledgeChunk, KnowledgeDocument

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Ingest a knowledge-base document into KnowledgeChunk with embeddings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            default=None,
            help="Path to the knowledge base text file. Default: settings.CHATBOT_CONTEXT_PATH",
        )
        parser.add_argument(
            "--title",
            type=str,
            default="ESWindows Knowledge Base",
            help="Title for the KnowledgeDocument record.",
        )
        parser.add_argument(
            "--chunk-size",
            type=int,
            default=400,
            help="Target chunk size in characters (default: 400).",
        )
        parser.add_argument(
            "--chunk-overlap",
            type=int,
            default=50,
            help="Overlap between consecutive chunks in characters (default: 50).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing chunks and documents before ingesting.",
        )

    def handle(self, *args, **options):
        file_path = options["file"] or str(
            getattr(settings, "CHATBOT_CONTEXT_PATH", settings.BASE_DIR / "context_gemini" / "bot_becomedelaer.txt")
        )
        title       = options["title"]
        chunk_size  = options["chunk_size"]
        overlap     = options["chunk_overlap"]
        clear       = options["clear"]

        path = Path(file_path)
        if not path.is_file():
            raise CommandError(f"File not found: {file_path}")

        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"  Knowledge Base Ingestion Pipeline")
        self.stdout.write(f"{'='*60}")
        self.stdout.write(f"  File:         {path}")
        self.stdout.write(f"  Title:        {title}")
        self.stdout.write(f"  Chunk size:   {chunk_size} chars")
        self.stdout.write(f"  Overlap:      {overlap} chars")
        self.stdout.write(f"{'='*60}\n")

        # ── Step 0: Clear existing data if requested ──────────────────
        if clear:
            deleted_chunks = KnowledgeChunk.objects.all().delete()[0]
            deleted_docs   = KnowledgeDocument.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(
                f"  Cleared {deleted_chunks} chunks + {deleted_docs} documents"
            ))

        # ── Step 1: Load the document ─────────────────────────────────
        content = path.read_text(encoding="utf-8")
        self.stdout.write(f"  Loaded {len(content)} chars from {path.name}")

        # ── Step 2: Split into semantic chunks ────────────────────────
        raw_chunks = self._split_by_sections(content)
        self.stdout.write(f"  Found {len(raw_chunks)} sections")

        final_chunks: List[Tuple[str, str]] = []  # (section, content)
        for section, section_text in raw_chunks:
            sub_chunks = self._split_text(section_text, chunk_size, overlap)
            for sc in sub_chunks:
                final_chunks.append((section, sc))

        self.stdout.write(f"  Split into {len(final_chunks)} total chunks")

        if not final_chunks:
            raise CommandError("No chunks generated — check the document format.")

        # ── Step 3: Generate embeddings ───────────────────────────────
        self.stdout.write("  Generating embeddings via text-embedding-004...")
        texts = [content for _, content in final_chunks]
        embeddings = get_embeddings_batch(texts)
        self.stdout.write(self.style.SUCCESS(f"  Generated {len(embeddings)} embeddings"))

        # ── Step 4: Store in database ─────────────────────────────────
        document, created = KnowledgeDocument.objects.get_or_create(
            title=title,
            defaults={"source": str(path)},
        )
        if not created:
            # Delete old chunks for this document (re-ingest)
            old_count = document.chunks.count()
            document.chunks.all().delete()
            document.source = str(path)
            document.save(update_fields=["source"])
            self.stdout.write(f"  Replaced {old_count} old chunks for '{title}'")

        chunk_objects = []
        for i, ((section, content_text), embedding) in enumerate(zip(final_chunks, embeddings)):
            chunk_objects.append(
                KnowledgeChunk(
                    document=document,
                    content=content_text,
                    section=section,
                    embedding=embedding,
                    metadata={
                        "chunk_index": i,
                        "chunk_size": len(content_text),
                        "source_file": path.name,
                    },
                )
            )

        KnowledgeChunk.objects.bulk_create(chunk_objects)

        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(self.style.SUCCESS(
            f"  ✓ Ingested {len(chunk_objects)} chunks into '{title}'"
        ))
        self.stdout.write(f"  Document ID: {document.pk}")
        self.stdout.write(f"  Document UUID: {document.uuid}")
        self.stdout.write(f"{'='*60}\n")

    # ── Text splitting helpers ───────────────────────────────────────────────

    @staticmethod
    def _split_by_sections(text: str) -> List[Tuple[str, str]]:
        """
        Split a markdown-like document by ``# N. SECTION TITLE`` headers.

        Returns:
            List of (section_title, section_content) tuples.
        """
        # Match lines like "# 1. AI INSTRUCTIONS" or "# 14. HOW TO BECOME..."
        section_pattern = re.compile(r'^#\s+\d+\.\s+(.+)$', re.MULTILINE)

        matches = list(section_pattern.finditer(text))

        if not matches:
            # No sections found — treat entire doc as one chunk
            return [("General", text.strip())]

        sections: List[Tuple[str, str]] = []

        # Content before the first section
        preamble = text[:matches[0].start()].strip()
        if preamble:
            sections.append(("Preamble", preamble))

        for i, match in enumerate(matches):
            section_title = match.group(1).strip()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section_content = text[start:end].strip()
            if section_content:
                sections.append((section_title, section_content))

        return sections

    @staticmethod
    def _split_text(text: str, chunk_size: int, overlap: int) -> List[str]:
        """
        Split text into chunks of approximately *chunk_size* characters,
        respecting paragraph boundaries where possible.

        Args:
            text: Text to split.
            chunk_size: Target size per chunk in characters.
            overlap: Number of overlapping characters between chunks.

        Returns:
            List of text chunks.
        """
        if len(text) <= chunk_size:
            return [text.strip()] if text.strip() else []

        # Split on double newlines (paragraphs) first
        paragraphs = re.split(r'\n\s*\n', text)
        paragraphs = [p.strip() for p in paragraphs if p.strip()]

        chunks: List[str] = []
        current_chunk: List[str] = []
        current_length = 0

        for para in paragraphs:
            if current_length + len(para) + 1 > chunk_size and current_chunk:
                # Flush current chunk
                chunks.append("\n\n".join(current_chunk))
                # Keep overlap from the end
                if overlap > 0 and current_chunk:
                    overlap_text = "\n\n".join(current_chunk)
                    overlap_start = max(0, len(overlap_text) - overlap)
                    carry_over = overlap_text[overlap_start:]
                    current_chunk = [carry_over]
                    current_length = len(carry_over)
                else:
                    current_chunk = []
                    current_length = 0

            current_chunk.append(para)
            current_length += len(para) + 2  # +2 for \n\n separator

        if current_chunk:
            chunk_text = "\n\n".join(current_chunk).strip()
            if chunk_text:
                chunks.append(chunk_text)

        return chunks
