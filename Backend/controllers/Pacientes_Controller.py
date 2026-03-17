from config.db_config import get_db_connection
from models.Pacientes_Model import Paciente
from fastapi.encoders import jsonable_encoder
import bcrypt


class PacientesController:

    def listar_pacientes(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM pacientes ORDER BY id DESC")
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_paciente(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM pacientes WHERE id = %s", (id,))
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "El paciente no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_cedula(self, cedula: str):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM pacientes WHERE cedula = %s", (cedula,))
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "No se encontró paciente con esa cédula"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_paciente(self, paciente: Paciente):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Verificar que no exista un paciente con esa cédula
            cursor.execute("SELECT id FROM pacientes WHERE cedula = %s", (paciente.cedula,))
            if cursor.fetchone():
                conn.close()
                return {"resultado": "Ya existe un paciente con esa cédula"}

            # Insertar paciente
            cursor.execute(
                "INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, telefono, "
                "email, direccion, genero, tipo_sangre, contacto_emergencia, telefono_emergencia, activo) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    paciente.nombre, paciente.apellido, paciente.cedula,
                    paciente.fecha_nacimiento, paciente.telefono, paciente.email,
                    paciente.direccion, paciente.genero, paciente.tipo_sangre,
                    paciente.contacto_emergencia, paciente.telefono_emergencia,
                    paciente.activo,
                ),
            )

            # Crear usuario automáticamente con rol Paciente (rol_id=2)
            # Contraseña por defecto: la cédula del paciente
            email_usuario = paciente.email or f"{paciente.cedula}@consultorio.local"
            hashed_pw = bcrypt.hashpw(paciente.cedula.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            cursor.execute(
                "INSERT INTO usuarios (nombre, apellido, email, password, telefono, cedula, rol_id, activo) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    paciente.nombre, paciente.apellido, email_usuario, hashed_pw,
                    paciente.telefono, paciente.cedula, 2, True,
                ),
            )

            conn.commit()
            conn.close()
            return {"informacion": "Paciente y usuario creados exitosamente. Contraseña por defecto: cédula del paciente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_paciente(self, id: int, paciente: Paciente):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, cedula FROM pacientes WHERE id = %s", (id,))
            pac_actual = cursor.fetchone()
            if not pac_actual:
                conn.close()
                return {"informacion": "El paciente no se encuentra en la base de datos"}

            cedula_anterior = pac_actual["cedula"]

            cursor.execute(
                "UPDATE pacientes SET nombre=%s, apellido=%s, cedula=%s, fecha_nacimiento=%s, "
                "telefono=%s, email=%s, direccion=%s, genero=%s, tipo_sangre=%s, "
                "contacto_emergencia=%s, telefono_emergencia=%s, activo=%s WHERE id=%s",
                (
                    paciente.nombre, paciente.apellido, paciente.cedula,
                    paciente.fecha_nacimiento, paciente.telefono, paciente.email,
                    paciente.direccion, paciente.genero, paciente.tipo_sangre,
                    paciente.contacto_emergencia, paciente.telefono_emergencia,
                    paciente.activo, id,
                ),
            )

            # Sincronizar datos del usuario asociado
            email_usuario = paciente.email or f"{paciente.cedula}@consultorio.local"
            cursor.execute(
                "UPDATE usuarios SET nombre=%s, apellido=%s, email=%s, telefono=%s, cedula=%s "
                "WHERE cedula=%s AND rol_id=2",
                (
                    paciente.nombre, paciente.apellido, email_usuario,
                    paciente.telefono, paciente.cedula, cedula_anterior,
                ),
            )

            conn.commit()
            conn.close()
            return {"informacion": "Paciente actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_paciente(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, cedula FROM pacientes WHERE id = %s", (id,))
            paciente = cursor.fetchone()
            if not paciente:
                conn.close()
                return {"informacion": "El paciente no se encuentra en la base de datos"}

            # Eliminar usuario asociado por cédula (rol_id=2)
            cursor.execute(
                "DELETE FROM usuarios WHERE cedula = %s AND rol_id = 2",
                (paciente["cedula"],),
            )

            # Eliminar paciente
            cursor.execute("DELETE FROM pacientes WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Paciente y usuario eliminados"}
        except Exception as error:
            return {"resultado": str(error)}


Pacientes_Controller = PacientesController()
