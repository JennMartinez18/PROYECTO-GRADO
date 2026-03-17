from pydantic import BaseModel
from typing import Optional


class HistoriaTratamiento(BaseModel):
    id: Optional[int] = None
    historia_clinica_id: int
    tratamiento_id: int
    estado: Optional[str] = "Planificado"
    fecha_inicio: Optional[str] = None
    fecha_finalizacion: Optional[str] = None
    precio_aplicado: Optional[float] = None
    observaciones: Optional[str] = None
