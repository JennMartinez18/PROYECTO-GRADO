"""
Genera links de invitación al Sandbox de WhatsApp Twilio.
El contacto solo toca el link y WhatsApp abre con el mensaje listo para enviar.

Uso: python sandbox_invite.py
"""
from urllib.parse import quote

# ── Configuración del Sandbox ─────────────────────────────────────
SANDBOX_NUMBER = "14155238886"    # Número sandbox de Twilio (siempre este)
JOIN_WORD      = "border-anyway"  # Palabra de unión (Twilio Console → WhatsApp Sandbox)

# ── Números a invitar ─────────────────────────────────────────────
CONTACTOS = [
    {"nombre": "Carlos", "numero": "+573045492433"},
    {"nombre": "Iber",   "numero": "+573132172050"},
]
# ─────────────────────────────────────────────────────────────────

def main():
    texto         = f"join {JOIN_WORD}"
    texto_encoded = quote(texto)

    print()
    print("=" * 60)
    print("  LINKS DE INVITACIÓN — comparte estos links con cada contacto")
    print("  Al tocarlo, WhatsApp se abre con el mensaje listo para enviar")
    print("=" * 60)

    for contacto in CONTACTOS:
        link = f"https://wa.me/{SANDBOX_NUMBER}?text={texto_encoded}"
        print(f"\n👤 {contacto['nombre']} ({contacto['numero']})")
        print(f"   {link}")

    print()
    print("=" * 60)
    print(f"  O diles que envíen: \"{texto}\"")
    print(f"  Al número de WhatsApp: +{SANDBOX_NUMBER}")
    print("=" * 60)


if __name__ == "__main__":
    main()
