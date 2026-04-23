"""
Base de conocimiento del Consultorio Odontológico María Luiza Balza.

Este archivo se lee al iniciar el chatbot y se divide en chunks
que se usan como contexto RAG para responder preguntas.

Cada sección separada por "===" se convierte en un chunk independiente.
"""

KNOWLEDGE_TEXT = """
=== Información General ===
El Consultorio Odontológico María Luiza Balza es un centro de atención dental profesional dedicado a brindar servicios de salud bucal de alta calidad. Nuestro compromiso es ofrecer tratamientos odontológicos modernos y efectivos en un ambiente cálido y seguro para nuestros pacientes.

=== Horario de Atención ===
Nuestro horario de atención es de lunes a viernes de 8:00 AM a 6:00 PM. Los sábados atendemos de 8:00 AM a 12:00 PM. Los domingos y días feriados no se atiende. Se recomienda agendar cita previa para garantizar la atención.

=== Servicios y Tratamientos ===
Ofrecemos una amplia gama de servicios odontológicos:
- Odontología General: Consultas, diagnósticos, limpiezas dentales y restauraciones.
- Ortodoncia: Tratamientos con brackets metálicos, estéticos y alineadores invisibles para corregir la posición dental.
- Endodoncia: Tratamientos de conducto para salvar piezas dentales dañadas o infectadas.
- Periodoncia: Tratamiento de enfermedades de las encías, raspado y alisado radicular.
- Cirugía Oral: Extracciones simples y complejas, incluyendo muelas del juicio.
- Implantología: Colocación de implantes dentales para reemplazar piezas perdidas.
- Odontopediatría: Atención dental especializada para niños y adolescentes.
- Estética Dental: Blanqueamiento dental, carillas y diseño de sonrisa.
- Prótesis Dental: Prótesis fijas y removibles, coronas y puentes dentales.
- Radiología Dental: Radiografías periapicales, panorámicas y tomografías para diagnóstico.

=== Ubicación ===
Estamos ubicados en una zona de fácil acceso. Para obtener la dirección exacta y cómo llegar, puede comunicarse directamente con nuestro consultorio a través de nuestros canales de contacto.

=== Contacto ===
Puede comunicarse con nosotros a través de los siguientes medios:
- Teléfono para agendar citas y consultas generales.
- Correo electrónico para información y consultas.
- También puede agendar su cita directamente a través de nuestro portal web en la sección "Mis Citas".
Para emergencias dentales fuera de horario, le recomendamos acudir al centro de salud más cercano.

=== Cómo Agendar una Cita ===
Para agendar una cita tiene varias opciones:
1. A través de nuestro portal web: Regístrese como paciente, inicie sesión y vaya a la sección "Mis Citas" donde podrá seleccionar el especialista, fecha y horario disponible.
2. Llamando por teléfono durante nuestro horario de atención.
3. Visitando directamente el consultorio.
Las citas se programan en bloques de 30 minutos y puede ver la disponibilidad en tiempo real a través del portal.

=== Primera Consulta ===
En su primera visita realizamos:
1. Evaluación completa de su salud bucal.
2. Radiografías diagnósticas si son necesarias.
3. Plan de tratamiento personalizado.
4. Presupuesto detallado de los tratamientos recomendados.
Le recomendamos traer sus documentos de identificación y cualquier historial dental previo que tenga disponible.

=== Emergencias Dentales ===
Si presenta dolor dental severo, inflamación, sangrado excesivo, fractura dental por trauma o infección dental, puede contactarnos durante el horario de atención para una cita de emergencia. Hacemos todo lo posible por atender emergencias el mismo día.

=== Cuidados Post-Tratamiento ===
Después de cada procedimiento, nuestro equipo le proporcionará instrucciones detalladas de cuidado. Es importante seguir las indicaciones del especialista para garantizar una recuperación exitosa. Si tiene dudas después de un procedimiento, no dude en contactarnos.

=== Preguntas Frecuentes ===
- ¿Cada cuánto debo visitar al dentista? Se recomienda una visita de control cada 6 meses para limpiezas y evaluación general.
- ¿Los tratamientos son dolorosos? Utilizamos anestesia local y técnicas modernas para minimizar cualquier molestia durante los procedimientos.
- ¿Atienden niños? Sí, contamos con servicio de odontopediatría para pacientes desde los 3 años de edad.
- ¿Ofrecen planes de pago? Consulte en recepción sobre las opciones de financiamiento disponibles.
- ¿Cuánto dura una consulta general? Una consulta general dura aproximadamente 30 minutos.
- ¿Puedo cancelar mi cita? Sí, puede cancelar o reprogramar su cita desde el portal web o llamando al consultorio con anticipación.
"""
