from fastapi import APIRouter, Depends, HTTPException
from controllers.Backup_Controller import Backup_Controller
from config.auth import require_admin

router = APIRouter()


@router.get(
    "/backup",
    summary="Listar backups",
    description="Obtiene el historial de backups generados.",
)
async def listar_backups(current_user: dict = Depends(require_admin)):
    return Backup_Controller.listar_backups()


@router.post(
    "/backup",
    summary="Crear backup manual",
    description="Genera un backup completo de la base de datos de forma inmediata.",
)
async def crear_backup(current_user: dict = Depends(require_admin)):
    return Backup_Controller.crear_backup_manual()


@router.get(
    "/backup/descargar/{nombre_archivo}",
    summary="Descargar backup",
    description="Descarga un archivo de backup específico.",
)
async def descargar_backup(nombre_archivo: str, current_user: dict = Depends(require_admin)):
    response = Backup_Controller.descargar_backup(nombre_archivo)
    if response is None:
        raise HTTPException(status_code=404, detail="Archivo de backup no encontrado")
    return response


@router.delete(
    "/backup/{nombre_archivo}",
    summary="Eliminar backup",
    description="Elimina un archivo de backup del servidor.",
)
async def eliminar_backup(nombre_archivo: str, current_user: dict = Depends(require_admin)):
    return Backup_Controller.eliminar_backup(nombre_archivo)
