from config.db_config import get_db_connection
from models.Roles_Model import Rol
from fastapi.encoders import jsonable_encoder


class RolesController:

    def listar_roles(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM roles ORDER BY id")
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_rol(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM roles WHERE id = %s", (id,))
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "El rol no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_rol(self, rol: Rol):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO roles (nombre, descripcion) VALUES (%s, %s)",
                (rol.nombre, rol.descripcion),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Rol registrado exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_rol(self, id: int, rol: Rol):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM roles WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El rol no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE roles SET nombre = %s, descripcion = %s WHERE id = %s",
                (rol.nombre, rol.descripcion, id),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Rol actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_rol(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM roles WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El rol no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM roles WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Rol eliminado"}
        except Exception as error:
            return {"resultado": str(error)}


Roles_Controller = RolesController()
