from fastapi import APIRouter, Depends
from controllers.Facturas_Controller import Facturas_Controller
from models.Facturas_Model import Factura, ActualizarEstadoFactura
from config.auth import get_current_user, require_staff

router = APIRouter()


@router.get(
    "/facturas",
    summary="Listar Facturas",
    description="Obtiene todas las facturas con datos del paciente y usuario emisor.",
    response_description="Lista de facturas",
)
async def listar_facturas(current_user: dict = Depends(require_staff)):
    return Facturas_Controller.listar_facturas()


@router.get(
    "/facturas/paciente/{paciente_id}",
    summary="Facturas por Paciente",
    description="Obtiene todas las facturas de un paciente específico.",
    response_description="Lista de facturas del paciente",
)
async def buscar_por_paciente(paciente_id: int, current_user: dict = Depends(get_current_user)):
    return Facturas_Controller.buscar_por_paciente(paciente_id)


@router.get(
    "/facturas/estado/{estado}",
    summary="Facturas por Estado",
    description="Filtra facturas por estado (Pendiente, Pagada, Vencida, Cancelada).",
    response_description="Lista de facturas filtradas",
)
async def buscar_por_estado(estado: str, current_user: dict = Depends(require_staff)):
    return Facturas_Controller.buscar_por_estado(estado)


@router.get(
    "/facturas/{id}",
    summary="Obtener Factura",
    description="Obtiene una factura por su ID.",
    response_description="Datos de la factura",
)
async def obtener_factura(id: int, current_user: dict = Depends(get_current_user)):
    return Facturas_Controller.obtener_factura(id)


@router.post(
    "/facturas",
    summary="Crear Factura",
    description="Genera una nueva factura con número auto-generado si no se especifica.",
    response_description="Confirmación de creación con número de factura",
)
async def insertar_factura(factura: Factura, current_user: dict = Depends(require_staff)):
    return Facturas_Controller.insertar_factura(factura)


@router.patch(
    "/facturas/{id}/estado",
    summary="Actualizar Estado de Factura",
    description="Cambia el estado de una factura y registra método/fecha de pago.",
    response_description="Confirmación de actualización",
)
async def actualizar_estado(id: int, datos: ActualizarEstadoFactura, current_user: dict = Depends(require_staff)):
    return Facturas_Controller.actualizar_estado(id, datos)


@router.put(
    "/facturas/{id}",
    summary="Actualizar Factura",
    description="Actualiza la información completa de una factura existente.",
    response_description="Confirmación de actualización",
)
async def actualizar_factura(id: int, factura: Factura, current_user: dict = Depends(require_staff)):
    return Facturas_Controller.actualizar_factura(id, factura)


@router.delete(
    "/facturas/{id}",
    summary="Eliminar Factura",
    description="Elimina una factura del sistema.",
    response_description="Confirmación de eliminación",
)
async def eliminar_factura(id: int, current_user: dict = Depends(require_staff)):
    return Facturas_Controller.eliminar_factura(id)
