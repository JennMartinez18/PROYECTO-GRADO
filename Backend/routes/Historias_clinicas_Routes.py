from fastapi import APIRouter, Depends
from controllers.Historias_clinicas_Controller import Historias_clinicas_Controller
from models.Historias_clinicas_Model import HistoriaClinica
from config.auth import get_current_user, require_staff

router = APIRouter()


@router.get(
    "/historias-clinicas",
    summary="Listar Historias Clínicas",
    description="Obtiene todas las historias clínicas con datos del paciente y doctor.",
    response_description="Lista de historias clínicas",
)
async def listar_historias(current_user: dict = Depends(require_staff)):
    return Historias_clinicas_Controller.listar_historias()


@router.get(
    "/historias-clinicas/paciente/{paciente_id}",
    summary="Historias por Paciente",
    description="Obtiene todas las historias clínicas de un paciente.",
    response_description="Lista de historias del paciente",
)
async def buscar_por_paciente(paciente_id: int, current_user: dict = Depends(get_current_user)):
    return Historias_clinicas_Controller.buscar_por_paciente(paciente_id)


@router.get(
    "/historias-clinicas/{id}",
    summary="Obtener Historia Clínica",
    description="Obtiene una historia clínica por su ID.",
    response_description="Datos de la historia clínica",
)
async def obtener_historia(id: int, current_user: dict = Depends(get_current_user)):
    return Historias_clinicas_Controller.obtener_historia(id)


@router.post(
    "/historias-clinicas",
    summary="Crear Historia Clínica",
    description="Registra una nueva historia clínica asociada a un paciente y cita.",
    response_description="Confirmación de creación",
)
async def insertar_historia(historia: HistoriaClinica, current_user: dict = Depends(require_staff)):
    return Historias_clinicas_Controller.insertar_historia(historia)


@router.put(
    "/historias-clinicas/{id}",
    summary="Actualizar Historia Clínica",
    description="Actualiza la información de una historia clínica existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_historia(id: int, historia: HistoriaClinica, current_user: dict = Depends(require_staff)):
    return Historias_clinicas_Controller.actualizar_historia(id, historia)


@router.delete(
    "/historias-clinicas/{id}",
    summary="Eliminar Historia Clínica",
    description="Elimina una historia clínica del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_historia(id: int, current_user: dict = Depends(require_staff)):
    return Historias_clinicas_Controller.eliminar_historia(id)
