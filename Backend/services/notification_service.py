import os
import json
from datetime import datetime, timedelta
from config.db_config import get_db_connection
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID   = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN    = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")   # ej: +14155238886
PAIS_CODE            = os.getenv("WHATSAPP_COUNTRY_CODE", "57")  # Colombia por defecto
CLINIC_ADDRESS       = os.getenv("CLINIC_ADDRESS", "CRA 8B 51 B 20, Bogotá, Colombia")


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


def _registrar_notificacion(conn, cita_id: int, telefono: str, mensaje_error: str, estado: str, tipo: str = "recordatorio_24h"):
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO notificaciones_recordatorio
           (cita_id, telefono, tipo, estado, mensaje_error, fecha_envio)
           VALUES (%s, %s, %s, %s, %s, NOW())""",
        (cita_id, telefono, tipo, estado, mensaje_error),
    )
    conn.commit()


# ── Recordatorio automático (scheduler 8:00 AM) ───────────────────

def procesar_recordatorios() -> dict:
    """Busca citas en las próximas 24 horas y envía recordatorios por WhatsApp."""
    try:
        conn    = get_db_connection()
        cursor  = conn.cursor(dictionary=True)
        ahora   = datetime.now()
        en_24h  = ahora + timedelta(hours=24)

        cursor.execute(
            """SELECT c.id, c.fecha, c.hora, c.consultorio,
                      p.nombre   AS paciente_nombre,
                      p.apellido AS paciente_apellido,
                      p.telefono
               FROM citas c
               JOIN pacientes p ON c.paciente_id = p.id
               WHERE c.estado IN ('Programada', 'Confirmada')
                 AND TIMESTAMP(c.fecha, c.hora) BETWEEN %s AND %s
                 AND c.id NOT IN (
                     SELECT cita_id FROM notificaciones_recordatorio
                     WHERE tipo = 'recordatorio_24h' AND estado = 'enviado'
                 )""",
            (ahora, en_24h),
        )
        citas    = cursor.fetchall()
        enviados = 0

        for cita in citas:
            telefono = cita.get("telefono") or ""
            if not telefono:
                _registrar_notificacion(conn, cita["id"], "", "Sin teléfono registrado", "fallido")
                continue

            nombre = f"{cita['paciente_nombre']} {cita['paciente_apellido']}"
            fecha  = str(cita["fecha"])
            hora   = str(cita["hora"])

            body = (
                f"🦷 *Recordatorio de Cita Odontológica*\n\n"
                f"Hola {nombre} 👋,\n\n"
                f"Te recordamos tu cita programada para mañana:\n\n"
                f"📅 *Fecha:* {fecha}\n"
                f"⏰ *Hora:* {hora}\n"
                f"🏥 *Consultorio:* {cita['consultorio']}\n"
                f"📍 *Dirección:* {CLINIC_ADDRESS}\n\n"
                f"Por favor llega con 10 minutos de anticipación.\n"
                f"Si no puedes asistir, comunícate con nosotros a la brevedad.\n\n"
                f"¡Te esperamos! 😊"
            )

            resultado = send_whatsapp_message(telefono, body)
            estado    = "enviado" if resultado["success"] else "fallido"
            error_msg = resultado.get("error", "") if not resultado["success"] else ""
            _registrar_notificacion(conn, cita["id"], telefono, error_msg, estado, "recordatorio_24h")
            if resultado["success"]:
                enviados += 1

        conn.close()
        return {"procesadas": len(citas), "enviadas": enviados}
    except Exception as e:
        return {"error": str(e)}


# ── Confirmación al crear cita ─────────────────────────────────────

def enviar_confirmacion_cita(cita_id: int) -> dict:
    """Envía un mensaje de confirmación al paciente cuando se registra su cita."""
    try:
        conn   = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT c.id, c.fecha, c.hora, c.consultorio,
                      p.nombre   AS paciente_nombre,
                      p.apellido AS paciente_apellido,
                      p.telefono
               FROM citas c
               JOIN pacientes p ON c.paciente_id = p.id
               WHERE c.id = %s""",
            (cita_id,),
        )
        cita = cursor.fetchone()
        if not cita:
            conn.close()
            return {"success": False, "error": "Cita no encontrada"}

        telefono = cita.get("telefono") or ""
        if not telefono:
            _registrar_notificacion(conn, cita_id, "", "Sin teléfono registrado", "fallido", "confirmacion")
            conn.close()
            return {"success": False, "error": "Paciente sin teléfono"}

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

        resultado = send_whatsapp_message(telefono, body)
        estado    = "enviado" if resultado["success"] else "fallido"
        error_msg = resultado.get("error", "") if not resultado["success"] else ""
        _registrar_notificacion(conn, cita_id, telefono, error_msg, estado, "confirmacion")
        conn.close()
        return resultado
    except Exception as e:
        return {"success": False, "error": str(e)}




