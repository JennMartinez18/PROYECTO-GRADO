"""
Servicio RAG simplificado para el chatbot del consultorio odontológico.

Usa Google Gemini para embeddings y generación de respuestas.
Los chunks se mantienen en memoria (sin necesidad de pgvector).
Las sesiones y mensajes se persisten en MySQL.
"""
import logging
import math
import os
import re
import time
import uuid
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from config.db_config import get_db_connection
from chatbot.knowledge import KNOWLEDGE_TEXT

load_dotenv()
logger = logging.getLogger(__name__)

# ── Configuración ────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768
CHAT_MODEL = "gemini-2.5-flash"
TOP_K = 4
MAX_HISTORY_TURNS = 8


# ── Embeddings ───────────────────────────────────────────────────────────────

def _ensure_gemini():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY no está configurada en .env")
    genai.configure(api_key=GEMINI_API_KEY)


def get_embedding(text: str, task: str = "retrieval_document") -> List[float]:
    _ensure_gemini()
    text = text[:2048].strip()
    if not text:
        return [0.0] * EMBEDDING_DIMENSIONS
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type=task,
        output_dimensionality=EMBEDDING_DIMENSIONS,
    )
    return result["embedding"]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ── Knowledge Chunks en memoria ──────────────────────────────────────────────

class KnowledgeStore:
    """Almacena chunks de conocimiento con sus embeddings en memoria."""

    def __init__(self):
        self.chunks: List[dict] = []
        self._loaded = False

    def load(self):
        if self._loaded:
            return
        logger.info("Cargando knowledge base y generando embeddings...")
        raw_sections = KNOWLEDGE_TEXT.strip().split("===")
        sections = []
        current_title = ""
        for part in raw_sections:
            part = part.strip()
            if not part:
                continue
            # Si el texto es corto, es un título de sección
            if len(part) < 80 and "\n" not in part:
                current_title = part
            else:
                sections.append({"title": current_title, "content": part})

        for section in sections:
            try:
                embedding = get_embedding(section["content"])
                self.chunks.append({
                    "title": section["title"],
                    "content": section["content"],
                    "embedding": embedding,
                })
            except Exception as e:
                logger.error("Error generando embedding para '%s': %s", section["title"], e)

        self._loaded = True
        logger.info("Knowledge base cargada: %d chunks", len(self.chunks))

    def retrieve(self, query: str, top_k: int = TOP_K) -> List[dict]:
        if not self._loaded:
            self.load()
        query_emb = get_embedding(query, task="retrieval_query")
        scored = []
        for chunk in self.chunks:
            score = cosine_similarity(query_emb, chunk["embedding"])
            scored.append({**chunk, "score": score})
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]


# Instancia global
knowledge_store = KnowledgeStore()


# ── Prompt Builder ───────────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """Eres el asistente virtual del Consultorio Odontológico María Luiza Balza. Eres amable, profesional y servicial.

REGLA DE SALUDO:
- Cuando el usuario envíe un saludo (hola, buenos días, buenas tardes, hey, etc.), responde con un saludo cálido y profesional, y pregunta en qué puedes ayudar.
- Ejemplo: "¡Hola! Bienvenido al Consultorio Odontológico María Luiza Balza. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?"

REGLA DE CONTACTO:
- Si el usuario pide hablar con una persona o necesita algo que el bot no puede resolver, indica que puede comunicarse directamente con el consultorio por teléfono o visitar las instalaciones.

REGLA DE MENSAJES INAPROPIADOS:
- Si el usuario envía mensajes ofensivos o inapropiados, responde de forma cordial: "Lo siento, no puedo procesar ese tipo de solicitud. Si tienes alguna pregunta sobre nuestros servicios odontológicos, estaré encantado de ayudarte."

REGLAS ESTRICTAS:
1. Solo puedes responder usando la información del contexto proporcionado abajo.
2. NO inventes información ni hagas suposiciones.
3. Si la respuesta no se encuentra en el contexto, responde: "No tengo información sobre ese tema. Te recomiendo comunicarte directamente con el consultorio para más detalles."
4. Solo respondes sobre el Consultorio Odontológico María Luiza Balza.
5. Si preguntan sobre otro consultorio o empresa, indica que solo puedes responder sobre este consultorio.
6. Responde SIEMPRE en español.
7. Mantén tus respuestas concisas, claras y profesionales.
8. NO uses formato markdown (sin asteriscos, sin almohadillas, sin backticks).
9. Usa un tono cercano pero profesional.

--- CONTEXTO ---
{context}
--- FIN CONTEXTO ---
"""


def build_system_prompt(context: str) -> str:
    if not context:
        context = "(No se encontró contexto relevante para esta pregunta.)"
    return SYSTEM_PROMPT_TEMPLATE.format(context=context)


def build_context(chunks: List[dict]) -> str:
    if not chunks:
        return ""
    parts = []
    for chunk in chunks:
        title = chunk.get("title", "General")
        parts.append(f"\n--- {title} ---\n{chunk['content']}\n")
    return "\n".join(parts).strip()


# ── Sesiones y Mensajes (MySQL) ──────────────────────────────────────────────

def _init_tables():
    """Crea las tablas de chat si no existen."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(36) UNIQUE NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            total_messages INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(36) NOT NULL,
            role VARCHAR(10) NOT NULL,
            content TEXT NOT NULL,
            response_time_ms INT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_session (session_id)
        )
    """)
    conn.commit()
    conn.close()


# Inicializar tablas al importar
try:
    _init_tables()
except Exception as e:
    logger.warning("No se pudieron crear tablas de chatbot: %s", e)


def get_or_create_session(session_id: Optional[str], ip_address: str = "") -> str:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if session_id:
        cursor.execute("SELECT session_id FROM chat_sessions WHERE session_id = %s", (session_id,))
        if cursor.fetchone():
            conn.close()
            return session_id
    new_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO chat_sessions (session_id, ip_address) VALUES (%s, %s)",
        (new_id, ip_address),
    )
    conn.commit()
    conn.close()
    return new_id


def save_messages(session_id: str, user_msg: str, bot_msg: str, response_ms: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_messages (session_id, role, content) VALUES (%s, 'user', %s)",
        (session_id, user_msg),
    )
    cursor.execute(
        "INSERT INTO chat_messages (session_id, role, content, response_time_ms) VALUES (%s, 'assistant', %s, %s)",
        (session_id, bot_msg, response_ms),
    )
    cursor.execute(
        "UPDATE chat_sessions SET total_messages = total_messages + 1 WHERE session_id = %s",
        (session_id,),
    )
    conn.commit()
    conn.close()


def get_chat_history(session_id: str, max_turns: int = MAX_HISTORY_TURNS) -> List[dict]:
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT role, content FROM chat_messages WHERE session_id = %s ORDER BY created_at DESC LIMIT %s",
        (session_id, max_turns * 2),
    )
    rows = list(reversed(cursor.fetchall()))
    conn.close()
    history = []
    for row in rows:
        gemini_role = "user" if row["role"] == "user" else "model"
        history.append({"role": gemini_role, "parts": [row["content"]]})
    return history


# ── Servicio principal ───────────────────────────────────────────────────────

def strip_markdown(text: str) -> str:
    text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
    text = re.sub(r'`([^`]*)`', r'\1', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'(?<!\S)[*#]+(?!\S)', '', text)
    return text.strip()


def ask_question(
    question: str,
    session_id: Optional[str] = None,
    ip_address: str = "",
) -> dict:
    """
    Pipeline RAG completo:
    1. Recuperar chunks relevantes
    2. Construir contexto
    3. Construir prompt del sistema
    4. Cargar historial de conversación
    5. Enviar a Gemini
    6. Persistir en BD
    7. Retornar respuesta
    """
    _ensure_gemini()
    t0 = time.monotonic()

    # 1. Retrieve
    chunks = knowledge_store.retrieve(question)

    # 2. Build context
    context = build_context(chunks)

    # 3. System prompt
    system_prompt = build_system_prompt(context)

    # 4. Session + history
    sid = get_or_create_session(session_id, ip_address)
    history = get_chat_history(sid)

    # 5. Call Gemini
    try:
        model = genai.GenerativeModel(
            model_name=CHAT_MODEL,
            system_instruction=system_prompt,
        )
        chat = model.start_chat(history=history)
        response = chat.send_message(question)
        answer = strip_markdown(response.text)
    except Exception as e:
        logger.exception("Error en Gemini API")
        raise RuntimeError(f"Error al procesar la pregunta: {e}")

    response_ms = int((time.monotonic() - t0) * 1000)

    # 6. Persist
    try:
        save_messages(sid, question, answer, response_ms)
    except Exception as e:
        logger.warning("No se pudo guardar el mensaje: %s", e)

    return {
        "response": answer,
        "session_id": sid,
        "response_time_ms": response_ms,
    }
