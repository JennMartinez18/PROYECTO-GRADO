from pydantic import BaseModel
from typing import Optional


class Usuario(BaseModel):
    id: Optional[int] = None
    nombre: str
    apellido: str
    email: str
    password: str
    telefono: Optional[str] = None
    cedula: Optional[str] = None
    rol_id: int
    activo: Optional[bool] = True
