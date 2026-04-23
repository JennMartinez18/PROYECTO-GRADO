from config.db_config import get_db_connection
from models.Citas_Model import Cita, CambiarEstadoCita
from fastapi.encoders import jsonable_encoder
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


# Horario de atención
HORA_INICIO = 8   # 08:00
HORA_FIN = 18     # 18:00
DURACION_SLOT = 30 # minutos


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
            nueva_cita_id = cursor.lastrowid
            conn.close()

            # Enviar confirmación por WhatsApp
            logger.info(f"Cita #{nueva_cita_id} creada — enviando confirmación WhatsApp")
            try:
                from services.notification_service import enviar_confirmacion_cita
                resultado_wa = enviar_confirmacion_cita(nueva_cita_id)
                if resultado_wa.get("success"):
                    logger.info(f"WhatsApp enviado OK — SID: {resultado_wa.get('message_id')}")
                else:
                    logger.warning(f"WhatsApp falló: {resultado_wa.get('error')}")
            except Exception as e:
                logger.error(f"Excepción al enviar WhatsApp: {e}")

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

    # ── Nuevos métodos para programación de citas ──

    def listar_doctores_disponibles(self, especialidad_id: int = None):
        """Devuelve doctores activos, opcionalmente filtrados por especialidad."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            if especialidad_id:
                cursor.execute(
                    "SELECT DISTINCT u.id, u.nombre, u.apellido, e.id AS especialidad_id, "
                    "e.nombre AS especialidad_nombre "
                    "FROM usuarios u "
                    "JOIN citas c ON c.usuario_id = u.id "
                    "JOIN especialidades e ON c.especialidad_id = e.id AND e.id = %s "
                    "WHERE u.rol_id = 4 AND u.activo = 1 "
                    "UNION "
                    "SELECT u.id, u.nombre, u.apellido, e.id AS especialidad_id, "
                    "e.nombre AS especialidad_nombre "
                    "FROM usuarios u, especialidades e "
                    "WHERE u.rol_id = 4 AND u.activo = 1 AND e.id = %s "
                    "ORDER BY nombre, apellido",
                    (especialidad_id, especialidad_id),
                )
            else:
                cursor.execute(
                    "SELECT u.id, u.nombre, u.apellido "
                    "FROM usuarios u WHERE u.rol_id = 4 AND u.activo = 1 "
                    "ORDER BY u.nombre, u.apellido"
                )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def horarios_disponibles(self, fecha: str, usuario_id: int):
        """Devuelve los slots de 30 min disponibles para un doctor en una fecha."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Citas activas del doctor en esa fecha
            cursor.execute(
                "SELECT hora, consultorio FROM citas "
                "WHERE fecha = %s AND usuario_id = %s "
                "AND estado NOT IN ('Cancelada', 'No_Asistio')",
                (fecha, usuario_id),
            )
            ocupados = cursor.fetchall()
            conn.close()

            # Set de (hora_str, consultorio) ocupados
            ocupados_set = set()
            for o in ocupados:
                h = o["hora"]
                if isinstance(h, timedelta):
                    total_sec = int(h.total_seconds())
                    hh = total_sec // 3600
                    mm = (total_sec % 3600) // 60
                    h = f"{hh:02d}:{mm:02d}"
                else:
                    h = str(h)[:5]
                ocupados_set.add((h, str(o["consultorio"])))

            # Generar todos los slots
            slots = []
            current = datetime.strptime(f"{HORA_INICIO:02d}:00", "%H:%M")
            end = datetime.strptime(f"{HORA_FIN:02d}:00", "%H:%M")
            while current < end:
                hora_str = current.strftime("%H:%M")
                consultorios_libres = []
                for cons in ["1", "2"]:
                    if (hora_str, cons) not in ocupados_set:
                        consultorios_libres.append(cons)
                if consultorios_libres:
                    slots.append({
                        "hora": hora_str,
                        "consultorios_disponibles": consultorios_libres,
                    })
                current += timedelta(minutes=DURACION_SLOT)

            return {"resultado": slots}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_doctor_rango(self, usuario_id: int, desde: str, hasta: str):
        """Devuelve citas de un doctor en un rango de fechas (para calendario)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT c.*, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido, "
                "u.nombre AS doctor_nombre, u.apellido AS doctor_apellido, "
                "e.nombre AS especialidad_nombre "
                "FROM citas c "
                "JOIN pacientes p ON c.paciente_id = p.id "
                "JOIN usuarios u ON c.usuario_id = u.id "
                "JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.usuario_id = %s AND c.fecha BETWEEN %s AND %s "
                "ORDER BY c.fecha, c.hora",
                (usuario_id, desde, hasta),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}


Citas_Controller = CitasController()
