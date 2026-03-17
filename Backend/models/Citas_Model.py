from pydantic import BaseModel
from typing import Optional


class Cita(BaseModel):
    id: Optional[int] = None
    paciente_id: int
    usuario_id: int
    especialidad_id: int
    fecha: str
    hora: str
    estado: Optional[str] = "Programada"
    observaciones: Optional[str] = None
    motivo_consulta: Optional[str] = None
    consultorio: str


class CambiarEstadoCita(BaseModel):
    estado: str
