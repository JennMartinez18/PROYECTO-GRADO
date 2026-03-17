from pydantic import BaseModel
from typing import Optional


class Especialidad(BaseModel):
    id: Optional[int] = None
    nombre: str
    descripcion: Optional[str] = None
    precio_base: Optional[float] = None
    duracion_minutos: Optional[int] = 60
