from fastapi import APIRouter
from controllers.Auth_Controller import Auth_Controller
from models.Auth_Model import LoginRequest, RegistroPaciente

router = APIRouter()


@router.post(
    "/login",
    summary="Iniciar Sesión",
    description="Autentica un usuario con email y contraseña. Retorna un token JWT.",
    response_description="Token de acceso y datos del usuario",
)
async def login(login_data: LoginRequest):
    return Auth_Controller.login(login_data)


@router.post(
    "/registro",
    summary="Registro de Paciente",
    description="Permite a un nuevo paciente registrarse en el sistema. Crea la cuenta de usuario y el registro de paciente.",
    response_description="Confirmación de registro",
)
async def registro_paciente(datos: RegistroPaciente):
    return Auth_Controller.registro_paciente(datos)
