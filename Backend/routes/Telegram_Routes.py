from fastapi import APIRouter, Request
from controllers.Telegram_Controller import Telegram_Controller

router = APIRouter()


@router.post(
    "/telegram/webhook",
    include_in_schema=False,  # Oculto del Swagger (endpoint interno para Telegram)
)
async def telegram_webhook(request: Request):
    return await Telegram_Controller.webhook(request)
