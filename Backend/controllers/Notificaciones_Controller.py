from config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder
from services.notification_service import procesar_recordatorios


class NotificacionesController:

    def listar_notificaciones(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT nr.*, c.fecha AS cita_fecha, c.hora AS cita_hora,
                          p.nombre AS paciente_nombre, p.apellido AS paciente_apellido
                   FROM notificaciones_recordatorio nr
                   JOIN citas c ON nr.cita_id = c.id
                   JOIN pacientes p ON c.paciente_id = p.id
                   ORDER BY nr.creado_en DESC
                   LIMIT 200"""
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as e:
            return {"resultado": str(e)}

    def estadisticas(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT
                     COUNT(*) AS total,
                     SUM(estado = 'enviado')  AS enviadas,
                     SUM(estado = 'fallido')  AS fallidas,
                     SUM(estado = 'pendiente') AS pendientes
                   FROM notificaciones_recordatorio"""
            )
            result = cursor.fetchone()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as e:
            return {"resultado": str(e)}

    def ejecutar_ahora(self):
        """Dispara manualmente el proceso de recordatorios."""
        return procesar_recordatorios()


Notificaciones_Controller = NotificacionesController()
