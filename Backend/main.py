import uvicorn
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
from routes.Auth_Routes import router as auth_router
from routes.Pacientes_Routes import router as pacientes_router
from routes.Citas_Routes import router as citas_router
from routes.Especialidades_Routes import router as especialidades_router
from routes.Usuarios_Routes import router as usuarios_router
from routes.Roles_Routes import router as roles_router
from routes.Tratamientos_Routes import router as tratamientos_router
from routes.Historias_clinicas_Routes import router as historias_clinicas_router
from routes.Historia_tratamientos_Routes import router as historia_tratamientos_router
from routes.Facturas_Routes import router as facturas_router
from routes.Dashboard_Routes import router as dashboard_router
from routes.Reportes_Routes import router as reportes_router
from routes.Notificaciones_Routes import router as notificaciones_router
from routes.Backup_Routes import router as backup_router
from chatbot.chatbot_routes import router as chatbot_router
from fastapi.middleware.cors import CORSMiddleware
from services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Sistema de Gestión Odontológico - María Luiza Balza",
    description="""
    ## API REST para la gestión integral del Consultorio Odontológico María Luiza Balza

    Esta API permite gestionar:

    * **Autenticación** - Login y registro con tokens JWT
    * **Dashboard** - Métricas y reportes del consultorio
    * **Pacientes** - Registro y gestión de pacientes
    * **Citas** - Programación y seguimiento de citas médicas
    * **Historias Clínicas** - Registros médicos de pacientes
    * **Tratamientos** - Catálogo y aplicación de tratamientos
    * **Facturas** - Gestión de facturación
    * **Usuarios** - Administración de usuarios del sistema
    * **Roles** - Control de accesos y permisos
    * **Especialidades** - Gestión de especialidades odontológicas
    * **Notificaciones** - Recordatorios automáticos por WhatsApp
    * **Backup** - Copias de seguridad automáticas de la base de datos

    ### Autenticación
    Use el endpoint `/auth/login` para obtener su token JWT.
    Incluya el token en el header: `Authorization: Bearer <token>`
    """,
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas públicas
app.include_router(auth_router, prefix="/auth", tags=["🔐 Autenticación"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["🤖 Chatbot"])

# Rutas protegidas
app.include_router(dashboard_router, prefix="/dashboard", tags=["📊 Dashboard"])
app.include_router(pacientes_router, tags=["👤 Pacientes"])
app.include_router(citas_router, tags=["📅 Citas"])
app.include_router(historias_clinicas_router, tags=["📋 Historias Clínicas"])
app.include_router(historia_tratamientos_router, tags=["💉 Historia de Tratamientos"])
app.include_router(tratamientos_router, tags=["🦷 Tratamientos"])
app.include_router(facturas_router, tags=["💰 Facturas"])
app.include_router(especialidades_router, tags=["⚕️ Especialidades"])
app.include_router(usuarios_router, tags=["👥 Usuarios"])
app.include_router(roles_router, tags=["🔑 Roles"])
app.include_router(reportes_router, prefix="/reportes", tags=["📈 Reportes"])
app.include_router(notificaciones_router, tags=["🔔 Notificaciones WhatsApp"])
app.include_router(backup_router, tags=["💾 Backup"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
