from fastapi import APIRouter, Depends
from controllers.Pacientes_Controller import Pacientes_Controller
from models.Pacientes_Model import Paciente
from config.auth import get_current_user, require_staff

router = APIRouter()


@router.get(
    "/pacientes",
    summary="Listar Pacientes",
    description="Obtiene todos los pacientes registrados.",
    response_description="Lista de pacientes",
)
async def listar_pacientes(current_user: dict = Depends(require_staff)):
    return Pacientes_Controller.listar_pacientes()


@router.get(
    "/pacientes/buscar/{cedula}",
    summary="Buscar Paciente por Cédula",
    description="Busca un paciente por su número de cédula.",
    response_description="Datos del paciente",
)
async def buscar_por_cedula(cedula: str, current_user: dict = Depends(get_current_user)):
    return Pacientes_Controller.buscar_por_cedula(cedula)


@router.get(
    "/pacientes/{id}",
    summary="Obtener Paciente",
    description="Obtiene un paciente por su ID.",
    response_description="Datos del paciente",
)
async def obtener_paciente(id: int, current_user: dict = Depends(get_current_user)):
    return Pacientes_Controller.obtener_paciente(id)


@router.post(
    "/pacientes",
    summary="Crear Paciente",
    description="Registra un nuevo paciente con sus datos personales y de contacto.",
    response_description="Confirmación de creación",
)
async def insertar_paciente(paciente: Paciente, current_user: dict = Depends(require_staff)):
    return Pacientes_Controller.insertar_paciente(paciente)


@router.put(
    "/pacientes/{id}",
    summary="Actualizar Paciente",
    description="Actualiza la información de un paciente existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_paciente(id: int, paciente: Paciente, current_user: dict = Depends(require_staff)):
    return Pacientes_Controller.actualizar_paciente(id, paciente)


@router.delete(
    "/pacientes/{id}",
    summary="Eliminar Paciente",
    description="Elimina un paciente del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_paciente(id: int, current_user: dict = Depends(require_staff)):
    return Pacientes_Controller.eliminar_paciente(id)
