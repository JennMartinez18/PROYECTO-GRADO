from config.db_config import get_db_connection
from models.Tratamientos_Model import Tratamiento
from fastapi.encoders import jsonable_encoder


class TratamientosController:

    def listar_tratamientos(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT t.*, e.nombre as especialidad_nombre "
                "FROM tratamientos t "
                "JOIN especialidades e ON t.especialidad_id = e.id "
                "ORDER BY t.nombre"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_tratamiento(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT t.*, e.nombre as especialidad_nombre "
                "FROM tratamientos t "
                "JOIN especialidades e ON t.especialidad_id = e.id "
                "WHERE t.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "El tratamiento no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_especialidad(self, especialidad_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT t.*, e.nombre as especialidad_nombre "
                "FROM tratamientos t "
                "JOIN especialidades e ON t.especialidad_id = e.id "
                "WHERE t.especialidad_id = %s AND t.activo = 1 ORDER BY t.nombre",
                (especialidad_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_tratamiento(self, tratamiento: Tratamiento):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tratamientos (nombre, descripcion, precio, duracion_sesiones, "
                "especialidad_id, activo) VALUES (%s, %s, %s, %s, %s, %s)",
                (
                    tratamiento.nombre, tratamiento.descripcion, tratamiento.precio,
                    tratamiento.duracion_sesiones, tratamiento.especialidad_id, tratamiento.activo,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Tratamiento registrado exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_tratamiento(self, id: int, tratamiento: Tratamiento):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM tratamientos WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El tratamiento no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE tratamientos SET nombre=%s, descripcion=%s, precio=%s, "
                "duracion_sesiones=%s, especialidad_id=%s, activo=%s WHERE id=%s",
                (
                    tratamiento.nombre, tratamiento.descripcion, tratamiento.precio,
                    tratamiento.duracion_sesiones, tratamiento.especialidad_id,
                    tratamiento.activo, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Tratamiento actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_tratamiento(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM tratamientos WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El tratamiento no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM tratamientos WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Tratamiento eliminado"}
        except Exception as error:
            return {"resultado": str(error)}


Tratamientos_Controller = TratamientosController()
