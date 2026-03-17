from config.db_config import get_db_connection
from models.Historia_tratamientos_Model import HistoriaTratamiento
from fastapi.encoders import jsonable_encoder


class HistoriaTratamientosController:

    def listar_historia_tratamientos(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT ht.*, t.nombre as tratamiento_nombre, t.precio as tratamiento_precio "
                "FROM historia_tratamientos ht "
                "JOIN tratamientos t ON ht.tratamiento_id = t.id "
                "ORDER BY ht.id DESC"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_historia_tratamiento(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT ht.*, t.nombre as tratamiento_nombre, t.precio as tratamiento_precio "
                "FROM historia_tratamientos ht "
                "JOIN tratamientos t ON ht.tratamiento_id = t.id "
                "WHERE ht.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "El registro no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_historia(self, historia_clinica_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT ht.*, t.nombre as tratamiento_nombre, t.precio as tratamiento_precio "
                "FROM historia_tratamientos ht "
                "JOIN tratamientos t ON ht.tratamiento_id = t.id "
                "WHERE ht.historia_clinica_id = %s ORDER BY ht.id",
                (historia_clinica_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_historia_tratamiento(self, ht: HistoriaTratamiento):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO historia_tratamientos (historia_clinica_id, tratamiento_id, estado, "
                "fecha_inicio, fecha_finalizacion, precio_aplicado, observaciones) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (
                    ht.historia_clinica_id, ht.tratamiento_id, ht.estado,
                    ht.fecha_inicio, ht.fecha_finalizacion, ht.precio_aplicado,
                    ht.observaciones,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Tratamiento asociado exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_historia_tratamiento(self, id: int, ht: HistoriaTratamiento):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM historia_tratamientos WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El registro no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE historia_tratamientos SET historia_clinica_id=%s, tratamiento_id=%s, "
                "estado=%s, fecha_inicio=%s, fecha_finalizacion=%s, precio_aplicado=%s, "
                "observaciones=%s WHERE id=%s",
                (
                    ht.historia_clinica_id, ht.tratamiento_id, ht.estado,
                    ht.fecha_inicio, ht.fecha_finalizacion, ht.precio_aplicado,
                    ht.observaciones, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Registro actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_historia_tratamiento(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM historia_tratamientos WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "El registro no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM historia_tratamientos WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Registro eliminado"}
        except Exception as error:
            return {"resultado": str(error)}


Historia_tratamientos_Controller = HistoriaTratamientosController()
