from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import Optional

from chatbot.chatbot_service import ask_question

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    response_time_ms: int


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(body: ChatRequest, request: Request):
    """Endpoint público del chatbot RAG para la landing page."""
    ip = request.client.host if request.client else ""
    result = ask_question(
        question=body.message,
        session_id=body.session_id,
        ip_address=ip,
    )
    return result
