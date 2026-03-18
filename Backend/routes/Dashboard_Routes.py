from fastapi import APIRouter, Depends
from controllers.Dashboard_Controller import Dashboard_Controller
from config.auth import require_staff, get_current_user

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


# ── Endpoints del Odontólogo ──

@router.get(
    "/metricas-doctor",
    summary="Métricas del Odontólogo",
    description="Métricas personales del odontólogo autenticado.",
    response_description="Métricas del doctor",
)
async def obtener_metricas_doctor(current_user: dict = Depends(get_current_user)):
    return Dashboard_Controller.obtener_metricas_doctor(current_user["user_id"])


@router.get(
    "/citas-hoy-doctor",
    summary="Citas de Hoy del Odontólogo",
    description="Citas del día del odontólogo autenticado.",
    response_description="Citas del día del doctor",
)
async def obtener_citas_hoy_doctor(current_user: dict = Depends(get_current_user)):
    return Dashboard_Controller.obtener_citas_hoy_doctor(current_user["user_id"])


@router.get(
    "/pacientes-doctor",
    summary="Pacientes del Odontólogo",
    description="Pacientes atendidos por el odontólogo autenticado.",
    response_description="Lista de pacientes del doctor",
)
async def obtener_pacientes_doctor(current_user: dict = Depends(get_current_user)):
    return Dashboard_Controller.obtener_pacientes_doctor(current_user["user_id"])


@router.get(
    "/historias-doctor",
    summary="Historias Clínicas del Odontólogo",
    description="Historias clínicas creadas por el odontólogo autenticado.",
    response_description="Historias del doctor",
)
async def obtener_historias_doctor(current_user: dict = Depends(get_current_user)):
    return Dashboard_Controller.obtener_historias_doctor(current_user["user_id"])


@router.get(
    "/tratamientos-doctor",
    summary="Tratamientos del Odontólogo",
    description="Tratamientos gestionados por el odontólogo autenticado.",
    response_description="Tratamientos del doctor",
)
async def obtener_tratamientos_doctor(current_user: dict = Depends(get_current_user)):
    return Dashboard_Controller.obtener_tratamientos_doctor(current_user["user_id"])
