from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="America/Bogota")


def start_scheduler():
    """Inicia el scheduler con las tareas programadas."""
    # Importación diferida para evitar ciclos
    from services.notification_service import procesar_recordatorios
    from services.backup_service import crear_backup

    # HU-02: Recordatorios WhatsApp — cada 5 minutos (deduplicación en BD)
    scheduler.add_job(
        procesar_recordatorios,
        IntervalTrigger(minutes=5),
        id="recordatorios_whatsapp",
        replace_existing=True,
        misfire_grace_time=300,
    )

    # HU-06: Backup automático — diariamente a las 2:00 AM
    scheduler.add_job(
        crear_backup,
        CronTrigger(hour=2, minute=0),
        id="backup_diario",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    scheduler.start()
    logger.info("Scheduler iniciado: recordatorios WhatsApp (08:00) y backup (02:00)")

    # Ejecutar recordatorios al inicio para no perder citas si el servidor estuvo apagado
    try:
        resultado = procesar_recordatorios()
        logger.info(f"Recordatorios al inicio: {resultado}")
    except Exception as e:
        logger.warning(f"Error al procesar recordatorios al inicio: {e}")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
