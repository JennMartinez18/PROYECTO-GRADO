from fastapi import APIRouter, Depends
from controllers.Roles_Controller import Roles_Controller
from models.Roles_Model import Rol
from config.auth import require_admin

router = APIRouter()


@router.get(
    "/roles",
    summary="Listar Roles",
    description="Obtiene todos los roles del sistema.",
    response_description="Lista de roles",
)
async def listar_roles(current_user: dict = Depends(require_admin)):
    return Roles_Controller.listar_roles()


@router.get(
    "/roles/{id}",
    summary="Obtener Rol",
    description="Obtiene un rol por su ID.",
    response_description="Datos del rol",
)
async def obtener_rol(id: int, current_user: dict = Depends(require_admin)):
    return Roles_Controller.obtener_rol(id)


@router.post(
    "/roles",
    summary="Crear Rol",
    description="Registra un nuevo rol en el sistema.",
    response_description="Confirmación de creación",
)
async def insertar_rol(rol: Rol, current_user: dict = Depends(require_admin)):
    return Roles_Controller.insertar_rol(rol)


@router.put(
    "/roles/{id}",
    summary="Actualizar Rol",
    description="Actualiza la información de un rol existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_rol(id: int, rol: Rol, current_user: dict = Depends(require_admin)):
    return Roles_Controller.actualizar_rol(id, rol)


@router.delete(
    "/roles/{id}",
    summary="Eliminar Rol",
    description="Elimina un rol del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_rol(id: int, current_user: dict = Depends(require_admin)):
    return Roles_Controller.eliminar_rol(id)
