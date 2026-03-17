from fastapi import APIRouter, Depends
from controllers.Dashboard_Controller import Dashboard_Controller
from config.auth import require_staff

router = APIRouter()


@router.get(
    "/metricas",
    summary="Métricas del Dashboard",
    description="Obtiene métricas generales: pacientes, citas del día, ingresos, tratamientos activos.",
    response_description="Métricas del consultorio",
)
async def obtener_metricas(current_user: dict = Depends(require_staff)):
    return Dashboard_Controller.obtener_metricas()


@router.get(
    "/citas-hoy",
    summary="Citas de Hoy",
    description="Lista detallada de todas las citas programadas para el día actual.",
    response_description="Lista de citas del día",
)
async def obtener_citas_hoy(current_user: dict = Depends(require_staff)):
    return Dashboard_Controller.obtener_citas_hoy()


@router.get(
    "/reporte-ingresos",
    summary="Reporte de Ingresos",
    description="Reporte de ingresos por mes y año con detalle de facturas pagadas.",
    response_description="Reporte de ingresos",
)
async def obtener_reporte_ingresos(mes: int, anio: int, current_user: dict = Depends(require_staff)):
    return Dashboard_Controller.obtener_reporte_ingresos(mes, anio)


@router.get(
    "/reporte-asistencia",
    summary="Reporte de Asistencia",
    description="Reporte de asistencia/ausentismo en un rango de fechas.",
    response_description="Reporte de asistencia",
)
async def obtener_reporte_asistencia(fecha_inicio: str, fecha_fin: str, current_user: dict = Depends(require_staff)):
    return Dashboard_Controller.obtener_reporte_asistencia(fecha_inicio, fecha_fin)
