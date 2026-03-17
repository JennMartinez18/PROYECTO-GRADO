from fastapi import APIRouter, Depends
from controllers.Historia_tratamientos_Controller import Historia_tratamientos_Controller
from models.Historia_tratamientos_Model import HistoriaTratamiento
from config.auth import get_current_user, require_staff

router = APIRouter()


@router.get(
    "/historia-tratamientos",
    summary="Listar Historia de Tratamientos",
    description="Obtiene todos los tratamientos aplicados en historias clínicas.",
    response_description="Lista de tratamientos aplicados",
)
async def listar_historia_tratamientos(current_user: dict = Depends(require_staff)):
    return Historia_tratamientos_Controller.listar_historia_tratamientos()


@router.get(
    "/historia-tratamientos/historia/{historia_clinica_id}",
    summary="Tratamientos por Historia Clínica",
    description="Obtiene los tratamientos asociados a una historia clínica.",
    response_description="Lista de tratamientos de la historia",
)
async def buscar_por_historia(historia_clinica_id: int, current_user: dict = Depends(get_current_user)):
    return Historia_tratamientos_Controller.buscar_por_historia(historia_clinica_id)


@router.get(
    "/historia-tratamientos/{id}",
    summary="Obtener Tratamiento de Historia",
    description="Obtiene un registro de tratamiento aplicado por su ID.",
    response_description="Datos del tratamiento aplicado",
)
async def obtener_historia_tratamiento(id: int, current_user: dict = Depends(get_current_user)):
    return Historia_tratamientos_Controller.obtener_historia_tratamiento(id)


@router.post(
    "/historia-tratamientos",
    summary="Asociar Tratamiento a Historia",
    description="Registra un tratamiento aplicado en una historia clínica con precio y estado.",
    response_description="Confirmación de creación",
)
async def insertar_historia_tratamiento(ht: HistoriaTratamiento, current_user: dict = Depends(require_staff)):
    return Historia_tratamientos_Controller.insertar_historia_tratamiento(ht)


@router.put(
    "/historia-tratamientos/{id}",
    summary="Actualizar Tratamiento de Historia",
    description="Actualiza un tratamiento aplicado en una historia clínica.",
    response_description="Confirmación de actualización",
)
async def actualizar_historia_tratamiento(id: int, ht: HistoriaTratamiento, current_user: dict = Depends(require_staff)):
    return Historia_tratamientos_Controller.actualizar_historia_tratamiento(id, ht)


@router.delete(
    "/historia-tratamientos/{id}",
    summary="Eliminar Tratamiento de Historia",
    description="Elimina un tratamiento asociado a una historia clínica.",
    response_description="Confirmación de eliminación",
)
async def eliminar_historia_tratamiento(id: int, current_user: dict = Depends(require_staff)):
    return Historia_tratamientos_Controller.eliminar_historia_tratamiento(id)
