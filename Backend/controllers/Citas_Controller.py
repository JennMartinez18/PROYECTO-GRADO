from config.db_config import get_db_connection
from models.Citas_Model import Cita, CambiarEstadoCita
from fastapi.encoders import jsonable_encoder


class CitasController:

    def listar_citas(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido, "
                "e.nombre as especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "ORDER BY c.fecha DESC, c.hora DESC"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_cita(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido, "
                "e.nombre as especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "La cita no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_fecha(self, fecha: str):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido, "
                "e.nombre as especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.fecha = %s ORDER BY c.hora",
                (fecha,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_paciente(self, paciente_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido, "
                "e.nombre as especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.paciente_id = %s ORDER BY c.fecha DESC, c.hora DESC",
                (paciente_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_doctor(self, usuario_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as doctor_nombre, u.apellido as doctor_apellido, "
                "e.nombre as especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.usuario_id = %s ORDER BY c.fecha DESC, c.hora DESC",
                (usuario_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def verificar_disponibilidad(self, fecha: str, hora: str, usuario_id: int, consultorio: str):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id FROM citas WHERE fecha = %s AND hora = %s "
                "AND usuario_id = %s AND consultorio = %s "
                "AND estado NOT IN ('Cancelada', 'No_Asistio')",
                (fecha, hora, usuario_id, consultorio),
            )
            result = cursor.fetchone()
            conn.close()
            if result:
                return {"disponible": False, "mensaje": "El horario no está disponible"}
            return {"disponible": True, "mensaje": "Horario disponible"}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_cita(self, cita: Cita):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Verificar disponibilidad
            cursor.execute(
                "SELECT id FROM citas WHERE fecha = %s AND hora = %s "
                "AND usuario_id = %s AND consultorio = %s "
                "AND estado NOT IN ('Cancelada', 'No_Asistio')",
                (cita.fecha, cita.hora, cita.usuario_id, cita.consultorio),
            )
            if cursor.fetchone():
                conn.close()
                return {"informacion": "El horario seleccionado no está disponible"}

            cursor.execute(
                "INSERT INTO citas (paciente_id, usuario_id, especialidad_id, fecha, hora, "
                "estado, observaciones, motivo_consulta, consultorio) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    cita.paciente_id, cita.usuario_id, cita.especialidad_id,
                    cita.fecha, cita.hora, cita.estado, cita.observaciones,
                    cita.motivo_consulta, cita.consultorio,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Cita registrada exitosamente"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_cita(self, id: int, cita: Cita):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM citas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La cita no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE citas SET paciente_id=%s, usuario_id=%s, especialidad_id=%s, "
                "fecha=%s, hora=%s, estado=%s, observaciones=%s, motivo_consulta=%s, "
                "consultorio=%s WHERE id=%s",
                (
                    cita.paciente_id, cita.usuario_id, cita.especialidad_id,
                    cita.fecha, cita.hora, cita.estado, cita.observaciones,
                    cita.motivo_consulta, cita.consultorio, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Cita actualizada"}
        except Exception as error:
            return {"resultado": str(error)}

    def cambiar_estado(self, id: int, datos: CambiarEstadoCita):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM citas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La cita no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE citas SET estado = %s WHERE id = %s",
                (datos.estado, id),
            )
            conn.commit()
            conn.close()
            return {"informacion": f"Estado de la cita actualizado a {datos.estado}"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_cita(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM citas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La cita no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM citas WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Cita eliminada"}
        except Exception as error:
            return {"resultado": str(error)}


Citas_Controller = CitasController()
