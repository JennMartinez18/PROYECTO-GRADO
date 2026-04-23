# 📚 Cómo Enseñar Más al Bot RAG — Guía Completa

Tu chatbot RAG aprende de **archivos de texto (.txt)** que convierte a embeddings vectoriales y almacena en PostgreSQL. Esta guía te explica paso a paso cómo agregar, actualizar y gestionar el conocimiento del bot.

---

## 🎯 Conceptos Clave

### ¿Cómo funciona el RAG (Retrieval-Augmented Generation)?

```
Usuario: "¿Qué son las ventanas premium?"
         ↓
         Convertir pregunta a vector (embedding)
         ↓
         Buscar en PostgreSQL los chunks más similares (pgvector)
         ↓
         Recuperar 5 chunks relevantes
         ↓
         Enviar chunks + pregunta a Gemini
         ↓
Respuesta: "Las ventanas premium ESWindows ofrecen..."
```

### Estructura de conocimiento

```
KnowledgeDocument (1 por archivo)
├── Título: "Catálogo de Productos"
├── Fuente: "productos.txt"
└── KnowledgeChunk[] (múltiples fragmentos)
    ├── content: "texto..." (400 chars)
    ├── section: "VENTANAS RESIDENCIALES"
    ├── embedding: [0.234, -0.567, ...] (768 dimensiones)
    └── metadata: {chunk_index, source_file, ...}
```

---

## 📝 Paso 1: Crear un Archivo de Conocimiento

### Ubicación
```
/app/context_gemini/tu_archivo.txt
```

### Estructura Recomendada

```markdown
# 1. SECCIÓN PRINCIPAL

Párrafo introductorio sobre el tema. Explica qué es y por qué es importante.

Este es el contenido que el bot usará para responder preguntas sobre este tema.
Mantén párrafos claros de 2-3 oraciones para mejor búsqueda.

## 1.1 Subsección Específica

Detalles más específicos aquí.

### 1.1.1 Punto más granular (opcional)

Información muy específica.

# 2. OTRA SECCIÓN PRINCIPAL

Nuevo tema completamente diferente...

## 2.1 Subsección

Detalles...

# 3. MÁS SECCIONES

...
```

### Ejemplo Real: Productos

```markdown
# 1. VENTANAS RESIDENCIALES

Las ventanas residenciales ESWindows están diseñadas para máxima eficiencia energética
y durabilidad en clima tropical. Ofrecemos múltiples marcos y cristales especializados.

## 1.1 Serie Premium

La serie Premium ofrece:
- Doble cristal de bajo emisivo
- Marco reforzado de PVC
- Aislamiento acústico de 45dB
- Garantía de 10 años

## 1.2 Serie Standard

La serie Standard es más económica:
- Cristal simple
- Marco estándar
- Garantía de 5 años

# 2. PUERTAS COMERCIALES

Diseñadas para tráfico intenso...

## 2.1 Puertas Automáticas

Sistema con sensor de movimiento...

# 3. ACCESORIOS

Herrajes, sellos, cierrapuertas...
```

### Tips para Mejor Búsqueda

✅ **Bueno:**
- Secciones bien organizadas (`# Número. Título`)
- Párrafos cortos (2-3 oraciones)
- Lenguaje claro y directo
- Términos específicos (nombres de productos, materiales)

❌ **Evita:**
- Párrafos muy largos sin saltos de línea
- Demasiadas siglas sin explicar
- Contenido desestructurado
- Repetición excesiva

---

## 🚀 Paso 2: Ingestar el Archivo

### Comando Básico

```bash
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge
```

Usa el archivo por defecto: `context_gemini/bot_becomedelaer.txt`

### Con Opciones Personalizadas

```bash
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/productos.txt \
  --title "Catálogo de Productos" \
  --chunk-size 400 \
  --chunk-overlap 50
```

### Parámetros Disponibles

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `--file` | `bot_becomedelaer.txt` | Ruta del archivo de texto (relativa a `/app/context_gemini/`) |
| `--title` | `ESWindows Knowledge Base` | Nombre del documento en la BD (para identificar) |
| `--chunk-size` | `400` | Tamaño máximo de cada chunk en caracteres |
| `--chunk-overlap` | `50` | Caracteres superpuestos entre chunks consecutivos (para contexto) |
| `--clear` | off | **Borra TODOS los documentos y chunks antes de ingestar.** Úsalo para reemplazar completamente la BD |

### Ejemplos de Ingestion

**Ingestar múltiples documentos (agregar conocimiento):**
```bash
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/productos.txt --title "Productos"
  
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/instalacion.txt --title "Instalación"
  
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/garantia.txt --title "Garantía"
```

**Reemplazar TODO (limpia y carga un archivo):**
```bash
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/nuevo_contenido.txt \
  --title "Nueva Base de Conocimiento" \
  --clear
```

**Re-ingestar un archivo después de editarlo:**
```bash
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/productos.txt
```
> ⚠️ Esto **no borra otros documentos**, solo actualiza este archivo.

### Salida Esperada

```
============================================================
  Knowledge Base Ingestion Pipeline
============================================================
  File:         /app/context_gemini/productos.txt
  Title:        Catálogo de Productos
  Chunk size:   400 chars
  Overlap:      50 chars
============================================================
  Loaded 12450 chars from productos.txt
  Found 15 sections
  Split into 42 total chunks
  Generating embeddings via text-embedding-004...
  Generated 42 embeddings

============================================================
  ✓ Ingested 42 chunks into 'Catálogo de Productos'
  Document ID: 2
  Document UUID: a1b2c3d4-e5f6-...
============================================================
```

✅ Si ves esto: **Éxito**
❌ Si hay error: Ver sección "Troubleshooting"

---

## ✅ Paso 3: Verificar que el Bot Aprendió

### Ver documentos ingestionados

```bash
docker exec thirdpartiesbackend-dev python manage.py shell << 'PYEOF'
from chatbot.models import KnowledgeDocument, KnowledgeChunk

print("=== DOCUMENTOS ===")
for doc in KnowledgeDocument.objects.all():
    chunk_count = doc.chunks.count()
    print(f"✓ {doc.title}")
    print(f"  Chunks: {chunk_count}")
    print(f"  UUID: {doc.uuid}")
    print()

print("=== TOTAL ===")
print(f"Total chunks en BD: {KnowledgeChunk.objects.count()}")
PYEOF
```

### Probar el endpoint directamente

```bash
curl -X POST http://localhost:8001/api/chatbot/rag/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuáles son las características de la serie Premium?"
  }' | python -m json.tool
```

**Respuesta esperada:**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "response": "La serie Premium de ventanas ESWindows ofrece...",
  "chunks_used": [
    "uuid-chunk-1",
    "uuid-chunk-2",
    "uuid-chunk-3"
  ],
  "sections_used": [
    "VENTANAS RESIDENCIALES",
    "Serie Premium"
  ],
  "response_time_ms": 2450
}
```

✅ Si ves `response` con contenido: **El bot sabe la respuesta**

---

## 🔄 Flujo Completo: Agregar Múltiples Documentos

El poder del RAG es que puede buscar **entre múltiples documentos automáticamente**.

### Ejemplo: Crear una Base de Conocimiento Completa

```bash
# 1. Crear archivos
cat > /app/context_gemini/productos.txt << 'EOF'
# 1. VENTANAS
...
EOF

cat > /app/context_gemini/instalacion.txt << 'EOF'
# 1. INSTALACIÓN
...
EOF

cat > /app/context_gemini/garantia.txt << 'EOF'
# 1. GARANTÍA
...
EOF

# 2. Ingestar todos (no borres los anteriores)
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/productos.txt --title "Productos"

docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/instalacion.txt --title "Instalación"

docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/garantia.txt --title "Garantía"

# 3. El bot ahora busca en los 3 documentos automáticamente
curl -X POST http://localhost:8001/api/chatbot/rag/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cómo instalo una ventana Premium?"}'

# Respuesta combinará chunks de "Productos" + "Instalación"
```

---

## 📊 Monitoreo y Mantenimiento

### Ver chunks de un documento específico

```bash
docker exec thirdpartiesbackend-dev python manage.py shell << 'PYEOF'
from chatbot.models import KnowledgeDocument

doc = KnowledgeDocument.objects.get(title="Productos")
print(f"Documento: {doc.title}")
print(f"Total chunks: {doc.chunks.count()}\n")

for i, chunk in enumerate(doc.chunks.all()[:5]):  # Primeros 5
    print(f"Chunk {i+1}:")
    print(f"  Section: {chunk.section}")
    print(f"  Content: {chunk.content[:100]}...")
    print(f"  UUID: {chunk.uuid}\n")
PYEOF
```

### Limpiar la BD completamente (nuclear option)

```bash
docker exec thirdpartiesbackend-dev python manage.py shell << 'PYEOF'
from chatbot.models import KnowledgeDocument, KnowledgeChunk

deleted_chunks = KnowledgeChunk.objects.all().delete()[0]
deleted_docs = KnowledgeDocument.objects.all().delete()[0]

print(f"Deleted {deleted_chunks} chunks")
print(f"Deleted {deleted_docs} documents")
PYEOF
```

---

## 🐛 Troubleshooting

### Error: "type "vector" does not exist"

**Causa:** pgvector no está instalado en PostgreSQL

**Solución:**
```bash
# En el servidor PostgreSQL
apt-get install postgresql-13-pgvector

# Activar extensión en tu BD específica
psql -U postgres -d tu_bd_nombre -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Error: "models/gemini-embedding-001 is not found"

**Causa:** La API de Google rechazó el embedding

**Solución:**
```bash
# Verifica la API key en settings.py
docker exec thirdpartiesbackend-dev grep GEMINI_API_KEY config/settings.py

# Asegúrate de que sea válida (no expirada)
```

### Error: "File not found"

**Causa:** Ruta incorrecta

**Solución:**
```bash
# Las rutas deben empezar con /app/ (dentro del container)
docker exec thirdpartiesbackend-dev ls -la /app/context_gemini/

# Si el archivo no existe, créalo:
docker exec thirdpartiesbackend-dev bash -c 'cat > /app/context_gemini/mi_archivo.txt << EOF
# Contenido aquí
EOF'
```

### El bot devuelve respuestas genéricas (no está usando el conocimiento)

**Causa:** Los chunks no contienen la información sobre ese tema

**Solución:**
1. Actualiza tu archivo de texto con más detalles
2. Re-ingesta:
   ```bash
   docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
     --file /app/context_gemini/tu_archivo.txt
   ```
3. Prueba nuevamente

---

## 💡 Best Practices

### 1. Organización de Contenido

```markdown
# 1. TEMA GENERAL

Introducción...

## 1.1 Subtema 1
Detalles...

## 1.2 Subtema 2
Detalles...

# 2. OTRO TEMA GENERAL

...
```

### 2. Tamaño Óptimo de Chunks

- **400 caracteres (default):** Bueno para la mayoría de casos
- **300 caracteres:** Si quieres más granularidad
- **600 caracteres:** Si tienes mucho contenido técnico

```bash
# Ajustar chunk size
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/tech.txt \
  --chunk-size 600  # Más grande para tech
```

### 3. Lenguaje Claro

✅ "La ventana Premium tiene cristal de bajo emisivo"
❌ "Vent. Prem. c/ cristal bajo emis."

### 4. Mantén Actualizado

Si cambias especificaciones, precios o características:
```bash
# Edita el archivo
nano /app/context_gemini/productos.txt

# Re-ingesta
docker exec thirdpartiesbackend-dev python manage.py ingest_knowledge \
  --file /app/context_gemini/productos.txt --title "Productos"
```

### 5. Documenta Versiones

```markdown
# 1. VENTANAS RESIDENCIALES (v2.0 - Marzo 2026)

Cambios respecto a v1.0:
- Nuevas características en Serie Premium
- Precios actualizados
- Nuevos colores disponibles

...
```

---

## 🔗 Integración con Frontend

### URL del Endpoint
```
POST /api/chatbot/rag/chat/
```

### Request
```json
{
  "message": "¿Cuáles son los beneficios de las ventanas premium?",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  // Opcional, omitir en primer mensaje
}
```

### Response
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "response": "Las ventanas premium ESWindows ofrecen...",
  "chunks_used": ["uuid-1", "uuid-2", "uuid-3"],
  "sections_used": ["VENTANAS RESIDENCIALES", "Serie Premium"],
  "response_time_ms": 2450
}
```

---

## 📞 Soporte Rápido

| Problema | Comando |
|----------|---------|
| Ver documentos | `docker exec app python manage.py shell -c "from chatbot.models import KnowledgeDocument; print([d.title for d in KnowledgeDocument.objects.all()])"` |
| Contar chunks | `docker exec app python manage.py shell -c "from chatbot.models import KnowledgeChunk; print(KnowledgeChunk.objects.count())"` |
| Ingestar defecto | `docker exec app python manage.py ingest_knowledge` |
| Limpiar todo | `docker exec app python manage.py ingest_knowledge --clear` |
| Probar endpoint | `curl -X POST http://localhost:8001/api/chatbot/rag/chat/ -H "Content-Type: application/json" -d '{"message":"test"}'` |

---

**última actualización:** Marzo 11, 2026
