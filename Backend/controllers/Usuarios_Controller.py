import bcrypt
from config.db_config import get_db_connection
from models.Usuarios_Model import Usuario
from fastapi.encoders import jsonable_encoder


class UsuariosController:

    def _hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def listar_usuarios(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.cedula, "
                "u.rol_id, u.activo, u.created_at, u.updated_at, r.nombre as rol_nombre "
                "FROM usuarios u JOIN roles r ON u.rol_id = r.id ORDER BY u.id"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_usuario(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.cedula, "
                "u.rol_id, u.activo, u.created_at, u.updated_at, r.nombre as rol_nombre "
                "FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "El usuario no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_usuario(self, usuario: Usuario):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            hashed_pw = self._hash_password(usuario.password)
            cursor.execute(
                "INSERT INTO usuarios (nombre, apellido, email, password, telefono, cedula, rol_id, activo) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    usuario.nombre, usuario.apellido, usuario.email, hashed_pw,
                    usuario.telefono, usuario.cedula, usuario.rol_id, usuario.activo,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Usuario registrado exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_usuario(self, id: int, usuario: Usuario):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM usuarios WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El usuario no se encuentra en la base de datos"}

            hashed_pw = self._hash_password(usuario.password)
            cursor.execute(
                "UPDATE usuarios SET nombre=%s, apellido=%s, email=%s, password=%s, "
                "telefono=%s, cedula=%s, rol_id=%s, activo=%s WHERE id=%s",
                (
                    usuario.nombre, usuario.apellido, usuario.email, hashed_pw,
                    usuario.telefono, usuario.cedula, usuario.rol_id, usuario.activo, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Usuario actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_usuario(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM usuarios WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El usuario no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Usuario eliminado"}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_doctores(self):
        """Obtener usuarios con rol de Odontólogo (rol_id = 4)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.cedula, "
                "u.rol_id, u.activo, r.nombre as rol_nombre "
                "FROM usuarios u JOIN roles r ON u.rol_id = r.id "
                "WHERE u.rol_id = 4 AND u.activo = 1 ORDER BY u.nombre, u.apellido"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}


Usuarios_Controller = UsuariosController()
