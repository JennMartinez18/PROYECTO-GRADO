from config.db_config import get_db_connection
from models.Historias_clinicas_Model import HistoriaClinica
from fastapi.encoders import jsonable_encoder


class HistoriasClinicasController:

    def listar_historias(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT hc.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido "
                "FROM historias_clinicas hc "
                "JOIN pacientes p ON hc.paciente_id = p.id "
                "JOIN usuarios u ON hc.usuario_id = u.id "
                "ORDER BY hc.fecha_atencion DESC"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_historia(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT hc.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido "
                "FROM historias_clinicas hc "
                "JOIN pacientes p ON hc.paciente_id = p.id "
                "JOIN usuarios u ON hc.usuario_id = u.id "
                "WHERE hc.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "La historia clínica no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_paciente(self, paciente_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT hc.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido "
                "FROM historias_clinicas hc "
                "JOIN pacientes p ON hc.paciente_id = p.id "
                "JOIN usuarios u ON hc.usuario_id = u.id "
                "WHERE hc.paciente_id = %s ORDER BY hc.fecha_atencion DESC",
                (paciente_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_historia(self, historia: HistoriaClinica):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO historias_clinicas (paciente_id, cita_id, usuario_id, fecha_atencion, "
                "motivo_consulta, diagnostico, observaciones, recomendaciones, proxima_cita) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    historia.paciente_id, historia.cita_id, historia.usuario_id,
                    historia.fecha_atencion, historia.motivo_consulta, historia.diagnostico,
                    historia.observaciones, historia.recomendaciones, historia.proxima_cita or None,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Historia clínica registrada exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_historia(self, id: int, historia: HistoriaClinica):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM historias_clinicas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La historia clínica no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE historias_clinicas SET paciente_id=%s, cita_id=%s, usuario_id=%s, "
                "fecha_atencion=%s, motivo_consulta=%s, diagnostico=%s, observaciones=%s, "
                "recomendaciones=%s, proxima_cita=%s WHERE id=%s",
                (
                    historia.paciente_id, historia.cita_id, historia.usuario_id,
                    historia.fecha_atencion, historia.motivo_consulta, historia.diagnostico,
                    historia.observaciones, historia.recomendaciones, historia.proxima_cita or None, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Historia clínica actualizada"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_historia(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM historias_clinicas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La historia clínica no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM historias_clinicas WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Historia clínica eliminada"}
        except Exception as error:
            return {"resultado": str(error)}


Historias_clinicas_Controller = HistoriasClinicasController()
