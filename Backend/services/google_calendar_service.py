import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH", "")
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "America/Bogota")


def _get_service():
    """Construye el cliente de Google Calendar usando una cuenta de servicio."""
    if not CREDENTIALS_PATH or not os.path.exists(CREDENTIALS_PATH):
        raise FileNotFoundError(
            "Credenciales de Google Calendar no encontradas. "
            "Configura GOOGLE_CREDENTIALS_PATH en el .env"
        )
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    import logging as _lg
    _lg.getLogger("googleapiclient.discovery_cache").setLevel(_lg.ERROR)

    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    return build("calendar", "v3", credentials=credentials)


def crear_evento_cita(cita_data: dict) -> dict:
    """
    Crea un evento en Google Calendar para la cita y envía invitación
    por correo al paciente.

    cita_data debe contener:
        fecha, hora, paciente_nombre, paciente_apellido, paciente_email,
        doctor_nombre, doctor_apellido, especialidad_nombre,
        motivo_consulta, consultorio
    """
    paciente_email = cita_data.get("paciente_email")

    try:
        service = _get_service()
    except FileNotFoundError as e:
        logger.warning(str(e))
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Error inicializando Google Calendar: {e}")
        return {"success": False, "error": str(e)}

    try:
        fecha = cita_data["fecha"]          # YYYY-MM-DD
        hora = str(cita_data["hora"])[:5]   # HH:MM

        start_dt = datetime.strptime(f"{fecha} {hora}", "%Y-%m-%d %H:%M")
        end_dt = start_dt + timedelta(minutes=30)

        attendees = []
        if paciente_email:
            attendees.append({"email": paciente_email})

        event_body = {
            "summary": f"Cita Médica – {cita_data.get('especialidad_nombre', 'Consulta')}",
            "location": f"Consultorio {cita_data.get('consultorio', '')}",
            "description": (
                f"Paciente: {cita_data.get('paciente_nombre', '')} {cita_data.get('paciente_apellido', '')}\n"
                f"Correo: {paciente_email or 'No registrado'}\n"
                f"Doctor: Dr./Dra. {cita_data.get('doctor_nombre', '')} {cita_data.get('doctor_apellido', '')}\n"
                f"Especialidad: {cita_data.get('especialidad_nombre', '')}\n"
                f"Motivo: {cita_data.get('motivo_consulta', '')}\n"
                f"Consultorio: {cita_data.get('consultorio', '')}"
            ),
            "start": {"dateTime": start_dt.isoformat(), "timeZone": CLINIC_TIMEZONE},
            "end":   {"dateTime": end_dt.isoformat(),   "timeZone": CLINIC_TIMEZONE},
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email",  "minutes": 24 * 60},
                    {"method": "popup",  "minutes": 30},
                ],
            },
        }

        created = service.events().insert(
            calendarId=CALENDAR_ID,
            body=event_body,
        ).execute()

        logger.info(
            f"Evento Google Calendar creado: {created.get('id')} – "
            f"invitación enviada a {paciente_email}"
        )
        return {
            "success": True,
            "event_id": created.get("id"),
            "event_link": created.get("htmlLink"),
        }

    except Exception as e:
        logger.error(f"Error creando evento en Google Calendar: {e}")
        return {"success": False, "error": str(e)}
