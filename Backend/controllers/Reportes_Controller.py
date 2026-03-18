from config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder


class ReportesControllerClass:

    def reporte_ingresos(self, mes: int, anio: int):
        """Reporte financiero: ingresos del mes, facturas detalladas, totales por método de pago."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Facturas pagadas del período
            cursor.execute(
                "SELECT f.id, f.numero_factura, f.total, f.metodo_pago, f.fecha_emision, f.fecha_pago, "
                "p.nombre AS paciente_nombre, p.apellido AS paciente_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "WHERE f.estado = 'Pagada' AND MONTH(f.fecha_pago) = %s AND YEAR(f.fecha_pago) = %s "
                "ORDER BY f.fecha_pago DESC",
                (mes, anio),
            )
            facturas = cursor.fetchall()

            # Total general
            cursor.execute(
                "SELECT COALESCE(SUM(total), 0) AS total_ingresos FROM facturas "
                "WHERE estado = 'Pagada' AND MONTH(fecha_pago) = %s AND YEAR(fecha_pago) = %s",
                (mes, anio),
            )
            total_ingresos = float(cursor.fetchone()["total_ingresos"])

            # Totales por método de pago
            cursor.execute(
                "SELECT metodo_pago, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS subtotal "
                "FROM facturas "
                "WHERE estado = 'Pagada' AND MONTH(fecha_pago) = %s AND YEAR(fecha_pago) = %s "
                "GROUP BY metodo_pago ORDER BY subtotal DESC",
                (mes, anio),
            )
            por_metodo = cursor.fetchall()

            # Facturas pendientes del mes
            cursor.execute(
                "SELECT COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS monto "
                "FROM facturas "
                "WHERE estado = 'Pendiente' AND MONTH(fecha_emision) = %s AND YEAR(fecha_emision) = %s",
                (mes, anio),
            )
            pendientes = cursor.fetchone()

            conn.close()
            return {
                "resultado": {
                    "facturas": jsonable_encoder(facturas),
                    "total_ingresos": total_ingresos,
                    "por_metodo": jsonable_encoder(por_metodo),
                    "pendientes_cantidad": pendientes["cantidad"],
                    "pendientes_monto": float(pendientes["monto"]),
                    "mes": mes,
                    "anio": anio,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def reporte_citas(self, fecha_inicio: str, fecha_fin: str):
        """Reporte de citas: resumen por estado, por especialidad, por odontólogo."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Totales por estado
            cursor.execute(
                "SELECT estado, COUNT(*) AS total FROM citas "
                "WHERE fecha BETWEEN %s AND %s GROUP BY estado ORDER BY total DESC",
                (fecha_inicio, fecha_fin),
            )
            por_estado = cursor.fetchall()

            # Total general
            cursor.execute(
                "SELECT COUNT(*) AS total FROM citas WHERE fecha BETWEEN %s AND %s",
                (fecha_inicio, fecha_fin),
            )
            total_citas = cursor.fetchone()["total"]

            # Por especialidad
            cursor.execute(
                "SELECT e.nombre AS especialidad, COUNT(*) AS total "
                "FROM citas c JOIN especialidades e ON c.especialidad_id = e.id "
                "WHERE c.fecha BETWEEN %s AND %s "
                "GROUP BY e.nombre ORDER BY total DESC",
                (fecha_inicio, fecha_fin),
            )
            por_especialidad = cursor.fetchall()

            # Por odontólogo
            cursor.execute(
                "SELECT CONCAT(u.nombre, ' ', u.apellido) AS odontologo, COUNT(*) AS total "
                "FROM citas c JOIN usuarios u ON c.usuario_id = u.id "
                "WHERE c.fecha BETWEEN %s AND %s "
                "GROUP BY u.id, u.nombre, u.apellido ORDER BY total DESC",
                (fecha_inicio, fecha_fin),
            )
            por_odontologo = cursor.fetchall()

            conn.close()
            return {
                "resultado": {
                    "total_citas": total_citas,
                    "por_estado": jsonable_encoder(por_estado),
                    "por_especialidad": jsonable_encoder(por_especialidad),
                    "por_odontologo": jsonable_encoder(por_odontologo),
                    "fecha_inicio": fecha_inicio,
                    "fecha_fin": fecha_fin,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def reporte_tratamientos(self):
        """Reporte de tratamientos: por estado, más aplicados, ingresos por tratamiento."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Por estado
            cursor.execute(
                "SELECT estado, COUNT(*) AS total FROM historia_tratamientos GROUP BY estado ORDER BY total DESC"
            )
            por_estado = cursor.fetchall()

            # Tratamientos más aplicados
            cursor.execute(
                "SELECT t.nombre, COUNT(*) AS veces_aplicado, "
                "COALESCE(SUM(ht.precio_aplicado), 0) AS ingresos_total "
                "FROM historia_tratamientos ht "
                "JOIN tratamientos t ON ht.tratamiento_id = t.id "
                "GROUP BY t.id, t.nombre ORDER BY veces_aplicado DESC LIMIT 10"
            )
            mas_aplicados = cursor.fetchall()

            # Ingresos totales de tratamientos
            cursor.execute(
                "SELECT COALESCE(SUM(precio_aplicado), 0) AS total FROM historia_tratamientos"
            )
            ingresos_total = float(cursor.fetchone()["total"])

            # Tratamientos activos vs completados
            cursor.execute("SELECT COUNT(*) AS total FROM historia_tratamientos WHERE estado IN ('Planificado','En_Progreso')")
            activos = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM historia_tratamientos WHERE estado = 'Completado'")
            completados = cursor.fetchone()["total"]

            # Catálogo de tratamientos disponibles
            cursor.execute(
                "SELECT t.nombre, t.precio, COALESCE(e.nombre, 'General') AS especialidad, "
                "t.duracion_sesiones "
                "FROM tratamientos t "
                "LEFT JOIN especialidades e ON t.especialidad_id = e.id "
                "WHERE t.activo = 1 ORDER BY t.nombre"
            )
            catalogo = cursor.fetchall()

            conn.close()
            return {
                "resultado": {
                    "por_estado": jsonable_encoder(por_estado),
                    "mas_aplicados": jsonable_encoder(mas_aplicados),
                    "ingresos_total": ingresos_total,
                    "activos": activos,
                    "completados": completados,
                    "catalogo": jsonable_encoder(catalogo),
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def reporte_pacientes(self):
        """Reporte de pacientes: total, demografía por género y tipo de sangre."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            # Total activos
            cursor.execute("SELECT COUNT(*) AS total FROM pacientes WHERE activo = 1")
            total = cursor.fetchone()["total"]

            # Por género
            cursor.execute(
                "SELECT CASE WHEN genero = 'M' THEN 'Masculino' WHEN genero = 'F' THEN 'Femenino' ELSE 'No especificado' END AS genero, "
                "COUNT(*) AS total FROM pacientes WHERE activo = 1 GROUP BY genero ORDER BY total DESC"
            )
            por_genero = cursor.fetchall()

            # Por tipo de sangre
            cursor.execute(
                "SELECT COALESCE(tipo_sangre, 'No especificado') AS tipo_sangre, COUNT(*) AS total "
                "FROM pacientes WHERE activo = 1 GROUP BY tipo_sangre ORDER BY total DESC"
            )
            por_tipo_sangre = cursor.fetchall()

            # Distribución por rango de edad
            cursor.execute(
                "SELECT "
                "SUM(CASE WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 18 THEN 1 ELSE 0 END) AS menores, "
                "SUM(CASE WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 18 AND 30 THEN 1 ELSE 0 END) AS jovenes, "
                "SUM(CASE WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 31 AND 50 THEN 1 ELSE 0 END) AS adultos, "
                "SUM(CASE WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) > 50 THEN 1 ELSE 0 END) AS mayores, "
                "SUM(CASE WHEN fecha_nacimiento IS NULL THEN 1 ELSE 0 END) AS sin_fecha "
                "FROM pacientes WHERE activo = 1"
            )
            edades = cursor.fetchone()

            # Nuevos pacientes este mes
            cursor.execute(
                "SELECT COUNT(*) AS total FROM pacientes "
                "WHERE activo = 1 AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())"
            )
            nuevos_row = cursor.fetchone()
            nuevos_mes = nuevos_row["total"] if nuevos_row else 0

            conn.close()
            return {
                "resultado": {
                    "total": total,
                    "por_genero": jsonable_encoder(por_genero),
                    "por_tipo_sangre": jsonable_encoder(por_tipo_sangre),
                    "por_edad": jsonable_encoder(edades),
                    "nuevos_mes": nuevos_mes,
                }
            }
        except Exception as error:
            return {"resultado": str(error)}

    def reporte_odontologos(self):
        """Reporte de productividad por odontólogo."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT u.id, CONCAT(u.nombre, ' ', u.apellido) AS nombre, "
                "COUNT(c.id) AS total_citas, "
                "SUM(CASE WHEN c.estado = 'Completada' THEN 1 ELSE 0 END) AS completadas, "
                "SUM(CASE WHEN c.estado = 'Cancelada' THEN 1 ELSE 0 END) AS canceladas, "
                "COUNT(DISTINCT c.paciente_id) AS pacientes_atendidos "
                "FROM usuarios u "
                "LEFT JOIN citas c ON u.id = c.usuario_id "
                "WHERE u.rol_id = 4 AND u.activo = 1 "
                "GROUP BY u.id, u.nombre, u.apellido "
                "ORDER BY total_citas DESC"
            )
            odontologos = cursor.fetchall()

            conn.close()
            return {"resultado": jsonable_encoder(odontologos)}
        except Exception as error:
            return {"resultado": str(error)}


Reportes_Controller = ReportesControllerClass()
