import os
from config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from services.backup_service import crear_backup, BACKUP_DIR


class BackupController:

    def listar_backups(self):
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM backups_historial ORDER BY creado_en DESC LIMIT 50"
            )
            result = cursor.fetchall()
            conn.close()
            return {"resultado": jsonable_encoder(result)}
        except Exception as e:
            return {"resultado": str(e)}

    def crear_backup_manual(self):
        """Genera un backup manual inmediatamente."""
        return crear_backup()

    def descargar_backup(self, nombre_archivo: str):
        """Retorna el archivo de backup para descarga."""
        ruta = os.path.join(BACKUP_DIR, nombre_archivo)
        if not os.path.exists(ruta):
            return None
        return FileResponse(
            path=ruta,
            filename=nombre_archivo,
            media_type="application/sql",
        )

    def eliminar_backup(self, nombre_archivo: str):
        """Elimina un archivo de backup del disco y su registro."""
        try:
            ruta = os.path.join(BACKUP_DIR, nombre_archivo)
            if os.path.exists(ruta):
                os.remove(ruta)
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM backups_historial WHERE nombre_archivo = %s",
                (nombre_archivo,),
            )
            conn.commit()
            conn.close()
            return {"informacion": "Backup eliminado"}
        except Exception as e:
            return {"resultado": str(e)}


Backup_Controller = BackupController()
