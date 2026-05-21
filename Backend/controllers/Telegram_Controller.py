import os
import requests
from fastapi import Request
from config.db_config import get_db_connection


def _send(chat_id: int, text: str) -> None:
    """Responde al usuario de Telegram con un mensaje de texto."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not token:
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text},
            timeout=10,
        )
    except Exception:
        pass


class TelegramController:

    async def webhook(self, request: Request) -> dict:
        """
        Procesa actualizaciones entrantes del bot de Telegram.
        El paciente vincula su cuenta enviando: /start <cedula>
        """
        try:
            body = await request.json()
        except Exception:
            return {"ok": True}

        message = body.get("message") or body.get("edited_message")
        if not message:
            return {"ok": True}

        chat_id = message.get("chat", {}).get("id")
        text    = (message.get("text") or "").strip()

        if not text.startswith("/start"):
            return {"ok": True}

        parts = text.split(maxsplit=1)
        if len(parts) < 2:
            _send(
                chat_id,
                "👋 Hola. Para vincular tu cuenta envía:\n\n/start TU_NUMERO_DE_CEDULA\n\nEjemplo: /start 1234567890",
            )
            return {"ok": True}

        cedula = parts[1].strip()
        try:
            conn   = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, nombre FROM pacientes WHERE cedula = %s LIMIT 1",
                (cedula,),
            )
            paciente = cursor.fetchone()

            if not paciente:
                cursor.close()
                conn.close()
                _send(
                    chat_id,
                    "❌ No encontramos un paciente registrado con esa cédula.\n"
                    "Verifica el número e inténtalo de nuevo.",
                )
                return {"ok": True}

            cursor.execute(
                "UPDATE pacientes SET telegram_chat_id = %s WHERE id = %s",
                (chat_id, paciente["id"]),
            )
            conn.commit()
            cursor.close()
            conn.close()

            _send(
                chat_id,
                f"✅ ¡Hola, {paciente['nombre']}! Tu cuenta de Telegram ha sido vinculada "
                f"correctamente. A partir de ahora recibirás aquí la confirmación de tus citas "
                f"y recordatorios 24 horas antes. 🦷",
            )
        except Exception:
            _send(chat_id, "⚠️ Ocurrió un error al vincular tu cuenta. Por favor intenta más tarde.")

        return {"ok": True}


Telegram_Controller = TelegramController()
