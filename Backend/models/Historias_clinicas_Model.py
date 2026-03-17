from pydantic import BaseModel
from typing import Optional


class HistoriaClinica(BaseModel):
    id: Optional[int] = None
    paciente_id: int
    cita_id: Optional[int] = None
    usuario_id: int
    fecha_atencion: str
    motivo_consulta: str
    diagnostico: Optional[str] = None
    observaciones: Optional[str] = None
    recomendaciones: Optional[str] = None
    proxima_cita: Optional[str] = None
