from fastapi import APIRouter, Depends
from controllers.Reportes_Controller import Reportes_Controller
from config.auth import require_admin

router = APIRouter()


@router.get(
    "/ingresos",
    summary="Reporte de Ingresos",
    description="Reporte financiero con facturas pagadas, totales por método de pago y pendientes.",
    response_description="Reporte de ingresos",
)
async def reporte_ingresos(mes: int, anio: int, current_user: dict = Depends(require_admin)):
    return Reportes_Controller.reporte_ingresos(mes, anio)


@router.get(
    "/citas",
    summary="Reporte de Citas",
    description="Reporte de citas por estado, especialidad y odontólogo en un rango de fechas.",
    response_description="Reporte de citas",
)
async def reporte_citas(fecha_inicio: str, fecha_fin: str, current_user: dict = Depends(require_admin)):
    return Reportes_Controller.reporte_citas(fecha_inicio, fecha_fin)


@router.get(
    "/tratamientos",
    summary="Reporte de Tratamientos",
    description="Reporte de tratamientos: por estado, más aplicados, ingresos.",
    response_description="Reporte de tratamientos",
)
async def reporte_tratamientos(current_user: dict = Depends(require_admin)):
    return Reportes_Controller.reporte_tratamientos()


@router.get(
    "/pacientes",
    summary="Reporte de Pacientes",
    description="Reporte demográfico: género, tipo de sangre, rango de edad, nuevos del mes.",
    response_description="Reporte de pacientes",
)
async def reporte_pacientes(current_user: dict = Depends(require_admin)):
    return Reportes_Controller.reporte_pacientes()


@router.get(
    "/odontologos",
    summary="Reporte de Odontólogos",
    description="Productividad por odontólogo: citas, completadas, canceladas, pacientes.",
    response_description="Reporte de odontólogos",
)
async def reporte_odontologos(current_user: dict = Depends(require_admin)):
    return Reportes_Controller.reporte_odontologos()
