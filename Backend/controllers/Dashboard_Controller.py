from config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder


class DashboardController:

    def obtener_metricas(self):
        """Métricas generales del dashboard administrativo."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Total pacientes activos
            cursor.execute("SELECT COUNT(*) as total FROM pacientes WHERE activo = 1")
            total_pacientes = cursor.fetchone()["total"]

            # Citas del día
            cursor.execute(
                "SELECT COUNT(*) as total FROM citas WHERE fecha = CURDATE()"
            )
            citas_hoy = cursor.fetchone()["total"]

            # Ingresos del mes
            cursor.execute(
                "SELECT COALESCE(SUM(total), 0) as total FROM facturas "
                "WHERE estado = 'Pagada' "
                "AND MONTH(fecha_pago) = MONTH(CURDATE()) "
                "AND YEAR(fecha_pago) = YEAR(CURDATE())"
            )
            ingresos_mes = cursor.fetchone()["total"]

            # Tratamientos activos
            cursor.execute(
                "SELECT COUNT(*) as total FROM historia_tratamientos "
                "WHERE estado IN ('Planificado', 'En_Progreso')"
            )
            tratamientos_activos = cursor.fetchone()["total"]

            # Citas programadas próximas (próximos 7 días)
            cursor.execute(
                "SELECT COUNT(*) as total FROM citas "
                "WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) "
                "AND estado IN ('Programada', 'Confirmada')"
            )
            citas_proximas = cursor.fetchone()["total"]

            # Facturas pendientes
            cursor.execute(
                "SELECT COUNT(*) as total FROM facturas WHERE estado = 'Pendiente'"
            )
            facturas_pendientes = cursor.fetchone()["total"]

            conn.close()
            return {
                "resultado": {
                    "total_pacientes": total_pacientes,
                    "citas_hoy": citas_hoy,
                    "ingresos_mes": float(ingresos_mes),
                    "tratamientos_activos": tratamientos_activos,
                    "citas_proximas": citas_proximas,
                    "facturas_pendientes": facturas_pendientes,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_citas_hoy(self):
        """Lista detallada de citas del día."""
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
                "WHERE c.fecha = CURDATE() ORDER BY c.hora"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_reporte_ingresos(self, mes: int, anio: int):
        """Reporte de ingresos por mes/año."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "WHERE f.estado = 'Pagada' AND MONTH(f.fecha_pago) = %s AND YEAR(f.fecha_pago) = %s "
                "ORDER BY f.fecha_pago DESC",
                (mes, anio),
            )
            facturas = cursor.fetchall()

            cursor.execute(
                "SELECT COALESCE(SUM(total), 0) as total_ingresos FROM facturas "
                "WHERE estado = 'Pagada' AND MONTH(fecha_pago) = %s AND YEAR(fecha_pago) = %s",
                (mes, anio),
            )
            total = cursor.fetchone()["total_ingresos"]

            conn.close()
            return {
                "resultado": {
                    "facturas": jsonable_encoder(facturas),
                    "total_ingresos": float(total),
                    "mes": mes,
                    "anio": anio,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_reporte_asistencia(self, fecha_inicio: str, fecha_fin: str):
        """Reporte de asistencia/ausentismo en un rango de fechas."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT estado, COUNT(*) as total FROM citas "
                "WHERE fecha BETWEEN %s AND %s GROUP BY estado",
                (fecha_inicio, fecha_fin),
            )
            result = cursor.fetchall()
            conn.close()
            return {
                "resultado": {
                    "detalle": jsonable_encoder(result),
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}


Dashboard_Controller = DashboardController()
