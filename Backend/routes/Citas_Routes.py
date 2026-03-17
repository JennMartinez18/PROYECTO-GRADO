from fastapi import APIRouter, Depends
from controllers.Citas_Controller import Citas_Controller
from models.Citas_Model import Cita, CambiarEstadoCita
from config.auth import get_current_user, require_staff

router = APIRouter()


@router.get(
    "/citas",
    summary="Listar Citas",
    description="Obtiene todas las citas con datos del paciente, doctor y especialidad.",
    response_description="Lista de citas",
)
async def listar_citas(current_user: dict = Depends(require_staff)):
    return Citas_Controller.listar_citas()


@router.get(
    "/citas/fecha/{fecha}",
    summary="Buscar Citas por Fecha",
    description="Obtiene las citas de una fecha específica (formato YYYY-MM-DD).",
    response_description="Lista de citas",
)
async def buscar_por_fecha(fecha: str, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.buscar_por_fecha(fecha)


@router.get(
    "/citas/paciente/{paciente_id}",
    summary="Buscar Citas por Paciente",
    description="Obtiene todas las citas de un paciente específico.",
    response_description="Lista de citas del paciente",
)
async def buscar_por_paciente(paciente_id: int, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.buscar_por_paciente(paciente_id)


@router.get(
    "/citas/doctor/{usuario_id}",
    summary="Buscar Citas por Doctor",
    description="Obtiene todas las citas asignadas a un odontólogo.",
    response_description="Lista de citas del doctor",
)
async def buscar_por_doctor(usuario_id: int, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.buscar_por_doctor(usuario_id)


@router.get(
    "/citas/disponibilidad",
    summary="Verificar Disponibilidad",
    description="Verifica si un horario está disponible para un odontólogo y consultorio.",
    response_description="Estado de disponibilidad",
)
async def verificar_disponibilidad(
    fecha: str, hora: str, usuario_id: int, consultorio: str,
    current_user: dict = Depends(get_current_user),
):
    return Citas_Controller.verificar_disponibilidad(fecha, hora, usuario_id, consultorio)


@router.get(
    "/citas/{id}",
    summary="Obtener Cita",
    description="Obtiene una cita por su ID.",
    response_description="Datos de la cita",
)
async def obtener_cita(id: int, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.obtener_cita(id)


@router.post(
    "/citas",
    summary="Crear Cita",
    description="Registra una nueva cita verificando disponibilidad del horario.",
    response_description="Confirmación de creación",
)
async def insertar_cita(cita: Cita, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.insertar_cita(cita)


@router.put(
    "/citas/{id}",
    summary="Actualizar Cita",
    description="Actualiza la información de una cita existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_cita(id: int, cita: Cita, current_user: dict = Depends(require_staff)):
    return Citas_Controller.actualizar_cita(id, cita)


@router.patch(
    "/citas/{id}/estado",
    summary="Cambiar Estado de Cita",
    description="Cambia el estado de una cita (Programada, Confirmada, En_Curso, Completada, Cancelada, No_Asistio).",
    response_description="Confirmación de cambio de estado",
)
async def cambiar_estado(id: int, datos: CambiarEstadoCita, current_user: dict = Depends(get_current_user)):
    return Citas_Controller.cambiar_estado(id, datos)


@router.delete(
    "/citas/{id}",
    summary="Eliminar Cita",
    description="Elimina una cita del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_cita(id: int, current_user: dict = Depends(require_staff)):
    return Citas_Controller.eliminar_cita(id)
