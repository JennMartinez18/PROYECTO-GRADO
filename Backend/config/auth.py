from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica el token JWT y retorna los datos del usuario autenticado."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.getenv("JWT_SECRET"),
            algorithms=[os.getenv("JWT_ALGORITHM", "HS256")]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def require_admin(current_user: dict = Depends(get_current_user)):
    """Requiere que el usuario sea Administrador (rol_id = 1)."""
    if current_user.get("rol_id") != 1:
        raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol de administrador")
    return current_user


async def require_staff(current_user: dict = Depends(get_current_user)):
    """Requiere que el usuario sea personal del consultorio (Admin, Recepcionista u Odontólogo)."""
    if current_user.get("rol_id") not in [1, 3, 4]:
        raise HTTPException(status_code=403, detail="Acceso denegado: se requiere rol de personal")
    return current_user
