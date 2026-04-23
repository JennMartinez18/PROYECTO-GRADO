"""
Script de prueba para envío de WhatsApp via Twilio.
Uso: python test_whatsapp.py
"""
import json
import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()

ACCOUNT_SID   = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN    = os.getenv("TWILIO_AUTH_TOKEN")
FROM_NUMBER   = os.getenv("TWILIO_WHATSAPP_FROM")
TEMPLATE_SID  = "HXd2dfd5370ba7a4cae48ab23444eff10e"
CLINIC_ADDRESS = os.getenv("CLINIC_ADDRESS", "CRA 8B 51 B 20, Bogotá, Colombia")

TO_NUMBER = "+573045492433"

variables = {
    "1": "Carlos (Prueba)",
    "2": "2026-04-24",
    "3": "10:00 AM",
    "4": CLINIC_ADDRESS,
}

print("=== Test WhatsApp Twilio ===")
print(f"  Account SID : {ACCOUNT_SID}")
print(f"  From        : whatsapp:{FROM_NUMBER}")
print(f"  To          : whatsapp:{TO_NUMBER}")
print(f"  Template    : {TEMPLATE_SID}")
print(f"  Variables   : {json.dumps(variables, ensure_ascii=False)}")
print()

try:
    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    message = client.messages.create(
        from_=f"whatsapp:{FROM_NUMBER}",
        content_sid=TEMPLATE_SID,
        content_variables=json.dumps(variables),
        to=f"whatsapp:{TO_NUMBER}",
    )
    print(f"✅ Mensaje enviado correctamente")
    print(f"   SID    : {message.sid}")
    print(f"   Status : {message.status}")
except TwilioRestException as e:
    print(f"❌ Error Twilio: {e.msg}")
    print(f"   Código : {e.code}")
except Exception as e:
    print(f"❌ Error inesperado: {e}")
