from pydantic import BaseModel
from typing import Optional


class Paciente(BaseModel):
    id: Optional[int] = None
    nombre: str
    apellido: str
    cedula: str
    fecha_nacimiento: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    genero: str
    tipo_sangre: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    activo: Optional[bool] = True
