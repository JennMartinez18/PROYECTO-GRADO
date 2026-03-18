import random
from config.db_config import get_db_connection
from models.Facturas_Model import Factura, ActualizarEstadoFactura
from fastapi.encoders import jsonable_encoder


class FacturasController:

    def _generar_numero_factura(self, cursor):
        while True:
            numero = f"FAC-{random.randint(100000, 999999)}"
            cursor.execute("SELECT id FROM facturas WHERE numero_factura = %s", (numero,))
            if not cursor.fetchone():
                return numero

    def listar_facturas(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as usuario_nombre, u.apellido as usuario_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "JOIN usuarios u ON f.usuario_id = u.id "
                "ORDER BY f.fecha_emision DESC"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def obtener_factura(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido, "
                "u.nombre as usuario_nombre, u.apellido as usuario_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "JOIN usuarios u ON f.usuario_id = u.id "
                "WHERE f.id = %s",
                (id,),
            )
            result = cursor.fetchone()
            conn.close()
            if not result:
                return {"informacion": "La factura no se encuentra en la base de datos"}
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_paciente(self, paciente_id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "WHERE f.paciente_id = %s ORDER BY f.fecha_emision DESC",
                (paciente_id,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def buscar_por_estado(self, estado: str):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT f.*, p.nombre as paciente_nombre, p.apellido as paciente_apellido "
                "FROM facturas f "
                "JOIN pacientes p ON f.paciente_id = p.id "
                "WHERE f.estado = %s ORDER BY f.fecha_emision DESC",
                (estado,),
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as error:
            return {"resultado": str(error)}

    def insertar_factura(self, factura: Factura):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            numero_factura = factura.numero_factura or self._generar_numero_factura(cursor)

            cursor.execute(
                "INSERT INTO facturas (numero_factura, paciente_id, usuario_id, cita_id, "
                "fecha_emision, total, estado, metodo_pago, fecha_pago, observaciones) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    numero_factura, factura.paciente_id, factura.usuario_id, factura.cita_id,
                    factura.fecha_emision, factura.total, factura.estado,
                    factura.metodo_pago, factura.fecha_pago, factura.observaciones,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Factura registrada exitosamente", "numero_factura": numero_factura}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_estado(self, id: int, datos: ActualizarEstadoFactura):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM facturas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La factura no se encuentra en la base de datos"}

            # Auto-asignar fecha_pago si se marca como Pagada y no viene fecha
            fecha_pago = datos.fecha_pago
            if datos.estado == "Pagada" and not fecha_pago:
                from datetime import date
                fecha_pago = date.today().isoformat()

            cursor.execute(
                "UPDATE facturas SET estado=%s, metodo_pago=%s, fecha_pago=%s WHERE id=%s",
                (datos.estado, datos.metodo_pago, fecha_pago, id),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Estado de factura actualizado"}
        except Exception as error:
            return {"resultado": str(error)}

    def actualizar_factura(self, id: int, factura: Factura):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM facturas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La factura no se encuentra en la base de datos"}

            cursor.execute(
                "UPDATE facturas SET paciente_id=%s, usuario_id=%s, cita_id=%s, "
                "fecha_emision=%s, total=%s, estado=%s, metodo_pago=%s, fecha_pago=%s, "
                "observaciones=%s WHERE id=%s",
                (
                    factura.paciente_id, factura.usuario_id, factura.cita_id,
                    factura.fecha_emision, factura.total, factura.estado,
                    factura.metodo_pago, factura.fecha_pago, factura.observaciones, id,
                ),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Factura actualizada"}
        except Exception as error:
            return {"resultado": str(error)}

    def eliminar_factura(self, id: int):
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM facturas WHERE id = %s", (id,))
            if not cursor.fetchone():
                conn.close()
                return {"informacion": "La factura no se encuentra en la base de datos"}

            cursor.execute("DELETE FROM facturas WHERE id = %s", (id,))
            conn.commit()
            conn.close()
            return {"informacion": "Factura eliminada"}
        except Exception as error:
            return {"resultado": str(error)}


Facturas_Controller = FacturasController()
