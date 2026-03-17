from fastapi import APIRouter, Depends
from controllers.Tratamientos_Controller import Tratamientos_Controller
from models.Tratamientos_Model import Tratamiento
from config.auth import get_current_user, require_admin

router = APIRouter()


@router.get(
    "/tratamientos",
    summary="Listar Tratamientos",
    description="Obtiene todos los tratamientos con su especialidad asociada.",
    response_description="Lista de tratamientos",
)
async def listar_tratamientos(current_user: dict = Depends(get_current_user)):
    return Tratamientos_Controller.listar_tratamientos()


@router.get(
    "/tratamientos/especialidad/{especialidad_id}",
    summary="Tratamientos por Especialidad",
    description="Obtiene los tratamientos activos de una especialidad.",
    response_description="Lista de tratamientos de la especialidad",
)
async def buscar_por_especialidad(especialidad_id: int, current_user: dict = Depends(get_current_user)):
    return Tratamientos_Controller.buscar_por_especialidad(especialidad_id)


@router.get(
    "/tratamientos/{id}",
    summary="Obtener Tratamiento",
    description="Obtiene un tratamiento por su ID.",
    response_description="Datos del tratamiento",
)
async def obtener_tratamiento(id: int, current_user: dict = Depends(get_current_user)):
    return Tratamientos_Controller.obtener_tratamiento(id)


@router.post(
    "/tratamientos",
    summary="Crear Tratamiento",
    description="Registra un nuevo tratamiento en el catálogo.",
    response_description="Confirmación de creación",
)
async def insertar_tratamiento(tratamiento: Tratamiento, current_user: dict = Depends(require_admin)):
    return Tratamientos_Controller.insertar_tratamiento(tratamiento)


@router.put(
    "/tratamientos/{id}",
    summary="Actualizar Tratamiento",
    description="Actualiza la información de un tratamiento existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_tratamiento(id: int, tratamiento: Tratamiento, current_user: dict = Depends(require_admin)):
    return Tratamientos_Controller.actualizar_tratamiento(id, tratamiento)


@router.delete(
    "/tratamientos/{id}",
    summary="Eliminar Tratamiento",
    description="Elimina un tratamiento del catálogo.",
    response_description="Confirmación de eliminación",
)
async def eliminar_tratamiento(id: int, current_user: dict = Depends(require_admin)):
    return Tratamientos_Controller.eliminar_tratamiento(id)
