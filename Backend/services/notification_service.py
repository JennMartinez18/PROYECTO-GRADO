import os
import json
import requests
from datetime import datetime, timedelta
from config.db_config import get_db_connection
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID   = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN    = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")   # ej: +14155238886
PAIS_CODE            = os.getenv("WHATSAPP_COUNTRY_CODE", "57")  # Colombia por defecto
CLINIC_ADDRESS       = os.getenv("CLINIC_ADDRESS", "CRA 8B 51 B 20, Bogotá, Colombia")
TELEGRAM_BOT_TOKEN   = os.getenv("TELEGRAM_BOT_TOKEN", "")


def _normalizar_telefono(telefono: str) -> str:
    """Normaliza el número de teléfono al formato E.164 con +."""
    numero = telefono.replace(" ", "").replace("-", "").replace("+", "").replace("(", "").replace(")", "")
    if not numero.startswith(PAIS_CODE):
        numero = PAIS_CODE + numero
    return f"+{numero}"


def _twilio_client():
    from twilio.rest import Client
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def send_whatsapp_message(telefono: str, body: str) -> dict:
    """Envía un mensaje de texto libre por WhatsApp usando Twilio."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_WHATSAPP_FROM:
        return {"success": False, "error": "Credenciales de Twilio no configuradas en .env"}

    try:
        from twilio.base.exceptions import TwilioRestException
        numero  = _normalizar_telefono(telefono)
        client  = _twilio_client()
        message = client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_FROM}",
            body=body,
            to=f"whatsapp:{numero}",
        )
        return {"success": True, "message_id": message.sid}
    except TwilioRestException as e:
        return {"success": False, "error": e.msg}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_telegram_message(chat_id: int, text: str) -> dict:
    """Envía un mensaje por Telegram usando la Bot API."""
    if not TELEGRAM_BOT_TOKEN:
        return {"success": False, "error": "TELEGRAM_BOT_TOKEN no configurado en .env"}
    try:
        url  = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        resp = requests.post(
            url,
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10,
        )
        data = resp.json()
        if data.get("ok"):
            return {"success": True, "message_id": data["result"]["message_id"]}
        return {"success": False, "error": data.get("description", "Error desconocido de Telegram")}
    except Exception as e:
        return {"success": False, "error": str(e)}


def _registrar_notificacion(conn, cita_id: int, telefono: str, mensaje_error: str, estado: str, tipo: str = "recordatorio_24h", canal: str = "whatsapp"):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO notificaciones_recordatorio
           (cita_id, telefono, tipo, estado, mensaje_error, fecha_envio, canal)
           VALUES (%s, %s, %s, %s, %s, NOW(), %s)""",
        (cita_id, telefono, tipo, estado, mensaje_error, canal),
    )
    conn.commit()


# ── Recordatorio automático (scheduler 8:00 AM) ───────────────────

def procesar_recordatorios() -> dict:
    """Busca citas en las próximas 24 horas y envía recordatorios por WhatsApp y Telegram."""
    try:
        conn    = get_db_connection()
        cursor  = conn.cursor(dictionary=True)
        ahora   = datetime.now()
        en_24h  = ahora + timedelta(hours=24)

        cursor.execute(
            """SELECT c.id, c.fecha, c.hora, c.consultorio,
                      p.nombre   AS paciente_nombre,
                      p.apellido AS paciente_apellido,
                      p.telefono,
                      p.telegram_chat_id
               FROM citas c
               JOIN pacientes p ON c.paciente_id = p.id
               WHERE c.estado IN ('Programada', 'Confirmada')
                 AND TIMESTAMP(c.fecha, c.hora) BETWEEN %s AND %s""",
            (ahora, en_24h),
        )
        citas = cursor.fetchall()

        # Citas ya notificadas por canal (evita duplicados)
        cursor.execute(
            """SELECT cita_id, canal FROM notificaciones_recordatorio
               WHERE tipo = 'recordatorio_24h' AND estado = 'enviado'"""
        )
        ya_enviadas       = cursor.fetchall()
        enviadas_whatsapp = {r["cita_id"] for r in ya_enviadas if r["canal"] == "whatsapp"}
        enviadas_telegram = {r["cita_id"] for r in ya_enviadas if r["canal"] == "telegram"}

        enviados_wa = 0
        enviados_tg = 0

        for cita in citas:
            nombre = f"{cita['paciente_nombre']} {cita['paciente_apellido']}"
            fecha  = str(cita["fecha"])
            hora   = str(cita["hora"])

            body = (
                f"🦷 *Recordatorio de Cita Odontológica*\n\n"
                f"Hola {nombre} 👋,\n\n"
                f"Te recordamos tu cita programada:\n\n"
                f"📅 *Fecha:* {fecha}\n"
                f"⏰ *Hora:* {hora}\n"
                f"🏥 *Consultorio:* {cita['consultorio']}\n"
                f"📍 *Dirección:* {CLINIC_ADDRESS}\n\n"
                f"Por favor llega con 10 minutos de anticipación.\n"
                f"Si no puedes asistir, comunícate con nosotros a la brevedad.\n\n"
                f"¡Te esperamos! 😊"
            )

            # ── WhatsApp ──────────────────────────────────────────
            telefono = cita.get("telefono") or ""
            if cita["id"] not in enviadas_whatsapp:
                if telefono:
                    resultado = send_whatsapp_message(telefono, body)
                    estado    = "enviado" if resultado["success"] else "fallido"
                    error_msg = resultado.get("error", "") if not resultado["success"] else ""
                    _registrar_notificacion(conn, cita["id"], telefono, error_msg, estado, "recordatorio_24h", "whatsapp")
                    if resultado["success"]:
                        enviados_wa += 1
                else:
                    _registrar_notificacion(conn, cita["id"], "", "Sin teléfono registrado", "fallido", "recordatorio_24h", "whatsapp")

            # ── Telegram ──────────────────────────────────────────
            chat_id = cita.get("telegram_chat_id")
            if chat_id and cita["id"] not in enviadas_telegram:
                resultado = send_telegram_message(chat_id, body)
                estado    = "enviado" if resultado["success"] else "fallido"
                error_msg = resultado.get("error", "") if not resultado["success"] else ""
                _registrar_notificacion(conn, cita["id"], "", error_msg, estado, "recordatorio_24h", "telegram")
                if resultado["success"]:
                    enviados_tg += 1

        conn.close()
        return {"procesadas": len(citas), "enviadas_whatsapp": enviados_wa, "enviadas_telegram": enviados_tg}
    except Exception as e:
        return {"error": str(e)}


# ── Confirmación al crear cita ─────────────────────────────────────

def enviar_confirmacion_cita(cita_id: int) -> dict:
    """Envía un mensaje de confirmación al paciente cuando se registra su cita (WhatsApp + Telegram)."""
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT c.id, c.fecha, c.hora, c.consultorio,
                      p.nombre   AS paciente_nombre,
                      p.apellido AS paciente_apellido,
                      p.telefono,
                      p.telegram_chat_id
               FROM citas c
               JOIN pacientes p ON c.paciente_id = p.id
               WHERE c.id = %s""",
            (cita_id,),
        )
        cita = cursor.fetchone()
        if not cita:
            conn.close()
            return {"success": False, "error": "Cita no encontrada"}

        nombre = f"{cita['paciente_nombre']} {cita['paciente_apellido']}"
        fecha  = str(cita["fecha"])
        hora   = str(cita["hora"])

        body = (
            f"✅ *Cita Confirmada*\n\n"
            f"Hola {nombre} 👋,\n\n"
            f"Tu cita odontológica ha sido registrada exitosamente:\n\n"
            f"📅 *Fecha:* {fecha}\n"
            f"⏰ *Hora:* {hora}\n"
            f"🏥 *Consultorio:* {cita['consultorio']}\n"
            f"📍 *Dirección:* {CLINIC_ADDRESS}\n\n"
            f"Por favor llega con 10 minutos de anticipación.\n"
            f"Para cancelar o modificar tu cita, contáctanos.\n\n"
            f"¡Hasta pronto! 😊"
        )

        resultado_wa = {"success": False, "error": "Sin teléfono"}
        resultado_tg = {"success": False, "error": "Sin Telegram vinculado"}

        # ── WhatsApp ──────────────────────────────────────────────
        telefono = cita.get("telefono") or ""
        if telefono:
            resultado_wa = send_whatsapp_message(telefono, body)
            estado    = "enviado" if resultado_wa["success"] else "fallido"
            error_msg = resultado_wa.get("error", "") if not resultado_wa["success"] else ""
            _registrar_notificacion(conn, cita_id, telefono, error_msg, estado, "confirmacion", "whatsapp")
        else:
            _registrar_notificacion(conn, cita_id, "", "Sin teléfono registrado", "fallido", "confirmacion", "whatsapp")

        # ── Telegram ──────────────────────────────────────────────
        chat_id = cita.get("telegram_chat_id")
        if chat_id:
            resultado_tg = send_telegram_message(chat_id, body)
            estado    = "enviado" if resultado_tg["success"] else "fallido"
            error_msg = resultado_tg.get("error", "") if not resultado_tg["success"] else ""
            _registrar_notificacion(conn, cita_id, "", error_msg, estado, "confirmacion", "telegram")

        conn.close()
        return {"whatsapp": resultado_wa, "telegram": resultado_tg}
    except Exception as e:
        return {"success": False, "error": str(e)}




