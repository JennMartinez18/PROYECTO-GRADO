import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from config.db_config import get_db_connection
from models.Auth_Model import LoginRequest, RegistroPaciente

load_dotenv()


class AuthController:

    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def _verify_password(self, plain: str, stored: str) -> bool:
        if stored.startswith("$2b$") or stored.startswith("$2a$"):
            return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))
        # Contraseña en texto plano (migración desde sistema antiguo)
        return plain == stored

    def _generate_token(self, user: dict, paciente_id: int = None) -> str:
        payload = {
            "user_id": user["id"],
            "email": user["email"],
            "rol_id": user["rol_id"],
            "nombre": user["nombre"],
            "exp": datetime.now(timezone.utc) + timedelta(
                hours=int(os.getenv("JWT_EXPIRATION_HOURS", 8))
            ),
        }
        if paciente_id:
            payload["paciente_id"] = paciente_id
        return jwt.encode(
            payload,
            os.getenv("JWT_SECRET"),
            algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        )

    def login(self, login_data: LoginRequest):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT u.*, r.nombre as rol_nombre FROM usuarios u "
                "JOIN roles r ON u.rol_id = r.id WHERE u.email = %s AND u.activo = 1",
                (login_data.email,),
            )
            user = cursor.fetchone()

            if not user:
                conn.close()
                return {"error": True, "mensaje": "Credenciales inválidas"}

            if not self._verify_password(login_data.password, user["password"]):
                conn.close()
                return {"error": True, "mensaje": "Credenciales inválidas"}

            # Migrar contraseña en texto plano a bcrypt
            if not user["password"].startswith("$2b$"):
                hashed = self._hash_password(login_data.password)
                cursor.execute(
                    "UPDATE usuarios SET password = %s WHERE id = %s",
                    (hashed, user["id"]),
                )
                conn.commit()

            usuario_data = {
                    "id": user["id"],
                    "nombre": user["nombre"],
                    "apellido": user["apellido"],
                    "email": user["email"],
                    "rol_id": user["rol_id"],
                    "rol_nombre": user["rol_nombre"],
            }

            paciente_id = None
            # Si es paciente, incluir paciente_id
            if user["rol_id"] == 2:
                cursor.execute(
                    "SELECT id FROM pacientes WHERE email = %s",
                    (user["email"],),
                )
                pac = cursor.fetchone()
                if pac:
                    paciente_id = pac["id"]
                    usuario_data["paciente_id"] = paciente_id

            token = self._generate_token(user, paciente_id)
            conn.close()

            return {
                "error": False,
                "access_token": token,
                "token_type": "bearer",
                "usuario": usuario_data,
            }
        except Exception as error:
            return {"error": True, "mensaje": str(error)}

    def registro_paciente(self, datos: RegistroPaciente):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Verificar email no duplicado
            cursor.execute("SELECT id FROM usuarios WHERE email = %s", (datos.email,))
            if cursor.fetchone():
                conn.close()
                return {"error": True, "mensaje": "El email ya está registrado"}

            # Verificar cédula no duplicada
            cursor.execute("SELECT id FROM pacientes WHERE cedula = %s", (datos.cedula,))
            if cursor.fetchone():
                conn.close()
                return {"error": True, "mensaje": "La cédula ya está registrada"}

            hashed_pw = self._hash_password(datos.password)

            # Crear usuario con rol Paciente (rol_id = 2)
            cursor.execute(
                "INSERT INTO usuarios (nombre, apellido, email, password, telefono, cedula, rol_id, activo) "
                "VALUES (%s, %s, %s, %s, %s, %s, 2, 1)",
                (datos.nombre, datos.apellido, datos.email, hashed_pw, datos.telefono, datos.cedula),
            )
            conn.commit()

            # Crear registro de paciente
            cursor.execute(
                "INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, telefono, email, "
                "direccion, genero, tipo_sangre, contacto_emergencia, telefono_emergencia, activo) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)",
                (
                    datos.nombre, datos.apellido, datos.cedula, datos.fecha_nacimiento,
                    datos.telefono, datos.email, datos.direccion, datos.genero,
                    datos.tipo_sangre, datos.contacto_emergencia, datos.telefono_emergencia,
                ),
            )
            conn.commit()
            conn.close()

            return {"error": False, "mensaje": "Paciente registrado exitosamente"}
        except Exception as error:
            return {"error": True, "mensaje": str(error)}


Auth_Controller = AuthController()
