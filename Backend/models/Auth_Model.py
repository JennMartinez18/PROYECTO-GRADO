from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RegistroPaciente(BaseModel):
    nombre: str
    apellido: str
    email: str
    password: str
    telefono: str
    cedula: str
    fecha_nacimiento: str
    direccion: str | None = None
    genero: str
    tipo_sangre: str | None = None
    contacto_emergencia: str | None = None
    telefono_emergencia: str | None = None
