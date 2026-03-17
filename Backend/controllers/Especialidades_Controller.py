from config.db_config import get_db_connection
from models.Especialidades_Model import Especialidad
from fastapi.encoders import jsonable_encoder


class EspecialidadesController:

    def listar_especialidades(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM especialidades ORDER BY nombre")
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_especialidad(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM especialidades WHERE id = %s", (id,))
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "La especialidad no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_especialidad(self, especialidad: Especialidad):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO especialidades (nombre, descripcion, precio_base, duracion_minutos) "
                "VALUES (%s, %s, %s, %s)",
                (especialidad.nombre, especialidad.descripcion, especialidad.precio_base, especialidad.duracion_minutos),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Especialidad registrada exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_especialidad(self, id: int, especialidad: Especialidad):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM especialidades WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La especialidad no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE especialidades SET nombre=%s, descripcion=%s, precio_base=%s, "
                "duracion_minutos=%s WHERE id=%s",
                (especialidad.nombre, especialidad.descripcion, especialidad.precio_base, especialidad.duracion_minutos, id),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Especialidad actualizada"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_especialidad(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM especialidades WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La especialidad no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM especialidades WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Especialidad eliminada"}
        except Exception as error:
            return {"resultado": str(error)}


Especialidades_Controller = EspecialidadesController()
