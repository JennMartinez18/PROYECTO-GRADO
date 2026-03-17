from fastapi import APIRouter, Depends
from controllers.Especialidades_Controller import Especialidades_Controller
from models.Especialidades_Model import Especialidad
from config.auth import get_current_user, require_admin

router = APIRouter()


@router.get(
    "/especialidades",
    summary="Listar Especialidades",
    description="Obtiene todas las especialidades odontológicas disponibles.",
    response_description="Lista de especialidades",
)
async def listar_especialidades(current_user: dict = Depends(get_current_user)):
    return Especialidades_Controller.listar_especialidades()


@router.get(
    "/especialidades/{id}",
    summary="Obtener Especialidad",
    description="Obtiene una especialidad por su ID.",
    response_description="Datos de la especialidad",
)
async def obtener_especialidad(id: int, current_user: dict = Depends(get_current_user)):
    return Especialidades_Controller.obtener_especialidad(id)


@router.post(
    "/especialidades",
    summary="Crear Especialidad",
    description="Registra una nueva especialidad en el catálogo.",
    response_description="Confirmación de creación",
)
async def insertar_especialidad(especialidad: Especialidad, current_user: dict = Depends(require_admin)):
    return Especialidades_Controller.insertar_especialidad(especialidad)


@router.put(
    "/especialidades/{id}",
    summary="Actualizar Especialidad",
    description="Actualiza la información de una especialidad existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_especialidad(id: int, especialidad: Especialidad, current_user: dict = Depends(require_admin)):
    return Especialidades_Controller.actualizar_especialidad(id, especialidad)


@router.delete(
    "/especialidades/{id}",
    summary="Eliminar Especialidad",
    description="Elimina una especialidad del catálogo.",
    response_description="Confirmación de eliminación",
)
async def eliminar_especialidad(id: int, current_user: dict = Depends(require_admin)):
    return Especialidades_Controller.eliminar_especialidad(id)
