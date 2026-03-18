from fastapi import APIRouter, Depends
from controllers.Usuarios_Controller import Usuarios_Controller
from models.Usuarios_Model import Usuario
from config.auth import require_admin, require_staff

router = APIRouter()


@router.get(
    "/usuarios",
    summary="Listar Usuarios",
    description="Obtiene todos los usuarios del sistema con sus roles asignados.",
    response_description="Lista de usuarios",
)
async def listar_usuarios(current_user: dict = Depends(require_admin)):
    return Usuarios_Controller.listar_usuarios()


@router.get(
    "/usuarios/doctores",
    summary="Listar Doctores",
    description="Obtiene la lista de odontólogos activos en el sistema.",
    response_description="Lista de doctores",
)
async def obtener_doctores(current_user: dict = Depends(require_staff)):
    return Usuarios_Controller.obtener_doctores()


@router.get(
    "/usuarios/{id}",
    summary="Obtener Usuario",
    description="Obtiene un usuario por su ID.",
    response_description="Datos del usuario",
)
async def obtener_usuario(id: int, current_user: dict = Depends(require_admin)):
    return Usuarios_Controller.obtener_usuario(id)


@router.post(
    "/usuarios",
    summary="Crear Usuario",
    description="Registra un nuevo usuario en el sistema con su rol y credenciales.",
    response_description="Confirmación de creación",
)
async def insertar_usuario(usuario: Usuario, current_user: dict = Depends(require_admin)):
    return Usuarios_Controller.insertar_usuario(usuario)


@router.put(
    "/usuarios/{id}",
    summary="Actualizar Usuario",
    description="Actualiza la información de un usuario existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_usuario(id: int, usuario: Usuario, current_user: dict = Depends(require_admin)):
    return Usuarios_Controller.actualizar_usuario(id, usuario)


@router.delete(
    "/usuarios/{id}",
    summary="Eliminar Usuario",
    description="Elimina un usuario del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_usuario(id: int, current_user: dict = Depends(require_admin)):
    return Usuarios_Controller.eliminar_usuario(id)
