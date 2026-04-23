from fastapi import APIRouter, Depends
from controllers.Notificaciones_Controller import Notificaciones_Controller
from config.auth import require_admin

router = APIRouter()


@router.get(
    "/notificaciones",
    summary="Listar notificaciones enviadas",
    description="Obtiene el historial de recordatorios WhatsApp enviados.",
)
async def listar_notificaciones(current_user: dict = Depends(require_admin)):
    return Notificaciones_Controller.listar_notificaciones()


@router.get(
    "/notificaciones/estadisticas",
    summary="Estadísticas de notificaciones",
    description="Total de notificaciones enviadas, fallidas y pendientes.",
)
async def estadisticas_notificaciones(current_user: dict = Depends(require_admin)):
    return Notificaciones_Controller.estadisticas()


@router.post(
    "/notificaciones/ejecutar",
    summary="Ejecutar recordatorios ahora",
    description="Dispara manualmente el proceso de envío de recordatorios WhatsApp.",
)
async def ejecutar_recordatorios(current_user: dict = Depends(require_admin)):
    return Notificaciones_Controller.ejecutar_ahora()
