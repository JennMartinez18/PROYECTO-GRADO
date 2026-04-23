"""
Script de debug para el proceso de notificaciones WhatsApp.
Ejecutar con: F5 → "Debug: Procesar Recordatorios"
O desde terminal: python debug_notificaciones.py
"""
import os
import json
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("  DEBUG NOTIFICACIONES WHATSAPP")
print("=" * 60)

# ── 1. Verificar variables de entorno ─────────────────────────────
print("\n[1] Variables de entorno:")
sid   = os.getenv("TWILIO_ACCOUNT_SID", "")
token = os.getenv("TWILIO_AUTH_TOKEN", "")
frm   = os.getenv("TWILIO_WHATSAPP_FROM", "")
pais  = os.getenv("WHATSAPP_COUNTRY_CODE", "57")
addr  = os.getenv("CLINIC_ADDRESS", "")

print(f"  TWILIO_ACCOUNT_SID   : {'✅ ' + sid[:8] + '...' if sid else '❌ NO CONFIGURADO'}")
print(f"  TWILIO_AUTH_TOKEN    : {'✅ ' + token[:6] + '...' if token else '❌ NO CONFIGURADO'}")
print(f"  TWILIO_WHATSAPP_FROM : {'✅ ' + frm if frm else '❌ NO CONFIGURADO'}")
print(f"  WHATSAPP_COUNTRY_CODE: {pais}")
print(f"  CLINIC_ADDRESS       : {addr or '⚠️  vacío'}")

if not (sid and token and frm):
    print("\n❌ Faltan credenciales. Revisa el archivo .env")
    exit(1)

# ── 2. Verificar conexión a BD ────────────────────────────────────
print("\n[2] Conexión a base de datos:")
try:
    from config.db_config import get_db_connection
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) AS total FROM citas WHERE estado IN ('Programada','Confirmada')")
    row = cursor.fetchone()
    print(f"  ✅ Conectado — citas activas: {row['total']}")
except Exception as e:
    print(f"  ❌ Error BD: {e}")
    exit(1)

# ── 3. Buscar citas en las próximas 24h ───────────────────────────
print("\n[3] Citas en las próximas 24 horas:")
from datetime import datetime, timedelta
ahora  = datetime.now()
en_24h = ahora + timedelta(hours=24)

cursor.execute(
    """SELECT c.id, c.fecha, c.hora, c.consultorio,
              p.nombre   AS paciente_nombre,
              p.apellido AS paciente_apellido,
              p.telefono
       FROM citas c
       JOIN pacientes p ON c.paciente_id = p.id
       WHERE c.estado IN ('Programada', 'Confirmada')
         AND TIMESTAMP(c.fecha, c.hora) BETWEEN %s AND %s""",
    (ahora, en_24h),
)
citas = cursor.fetchall()
print(f"  Rango: {ahora.strftime('%Y-%m-%d %H:%M')} → {en_24h.strftime('%Y-%m-%d %H:%M')}")
print(f"  Citas encontradas: {len(citas)}")
for c in citas:
    print(f"  → #{c['id']} | {c['paciente_nombre']} {c['paciente_apellido']} | tel: {c['telefono'] or '⚠️ SIN TELÉFONO'} | {c['fecha']} {c['hora']}")

if not citas:
    print("\n  ⚠️  No hay citas en las próximas 24h — crea una cita de prueba con fecha/hora para mañana.")

# ── 4. Verificar cuáles ya tienen recordatorio enviado ────────────
print("\n[4] Citas con recordatorio ya enviado:")
cursor.execute(
    """SELECT cita_id FROM notificaciones_recordatorio
       WHERE tipo = 'recordatorio_24h' AND estado = 'enviado'"""
)
ya_enviados = {r["cita_id"] for r in cursor.fetchall()}
print(f"  IDs con recordatorio previo: {ya_enviados or 'ninguno'}")

pendientes = [c for c in citas if c["id"] not in ya_enviados]
print(f"  Citas pendientes de envío: {len(pendientes)}")

# ── 5. Probar envío a la primera cita pendiente ───────────────────
if pendientes:
    cita = pendientes[0]
    telefono = cita.get("telefono") or ""
    print(f"\n[5] Probando envío a cita #{cita['id']} → {telefono}")

    if not telefono:
        print("  ❌ El paciente no tiene teléfono registrado")
    else:
        from services.notification_service import send_whatsapp_message, _normalizar_telefono
        numero_normalizado = _normalizar_telefono(telefono)
        print(f"  Teléfono normalizado: {numero_normalizado}")

        body = (
            f"[DEBUG] 🦷 Recordatorio de prueba\n"
            f"Hola {cita['paciente_nombre']}, tu cita es el {cita['fecha']} a las {cita['hora']}.\n"
            f"Consultorio: {cita['consultorio']} — {os.getenv('CLINIC_ADDRESS','')}"
        )
        print(f"  Body del mensaje:\n{body}\n")

        resultado = send_whatsapp_message(telefono, body)
        if resultado["success"]:
            print(f"  ✅ Enviado! SID: {resultado['message_id']}")
        else:
            print(f"  ❌ Error: {resultado['error']}")
else:
    print("\n[5] No hay citas pendientes para probar envío")

conn.close()
print("\n" + "=" * 60)
print("  FIN DEL DEBUG")
print("=" * 60)
