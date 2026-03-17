from pydantic import BaseModel
from typing import Optional


class Tratamiento(BaseModel):
    id: Optional[int] = None
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    duracion_sesiones: Optional[int] = 1
    especialidad_id: int
    activo: Optional[bool] = True
