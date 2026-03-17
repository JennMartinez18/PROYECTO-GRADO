from pydantic import BaseModel
from typing import Optional


class Factura(BaseModel):
    id: Optional[int] = None
    numero_factura: Optional[str] = None
    paciente_id: int
    usuario_id: int
    cita_id: Optional[int] = None
    fecha_emision: str
    total: float
    estado: Optional[str] = "Pendiente"
    metodo_pago: Optional[str] = None
    fecha_pago: Optional[str] = None
    observaciones: Optional[str] = None


class ActualizarEstadoFactura(BaseModel):
    estado: str
    metodo_pago: Optional[str] = None
    fecha_pago: Optional[str] = None
