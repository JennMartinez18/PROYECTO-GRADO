import os
from datetime import datetime
from config.db_config import get_db_connection
from dotenv import load_dotenv

load_dotenv()

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backups")
MAX_BACKUPS = 30


def crear_backup() -> dict:
    """Genera un dump SQL completo de la base de datos usando mysql-connector."""
    os.makedirs(BACKUP_DIR, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre = f"backup_{timestamp}.sql"
    ruta = os.path.join(BACKUP_DIR, nombre)

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener listado de tablas
        cursor.execute("SHOW TABLES")
        tablas = [list(row.values())[0] for row in cursor.fetchall()]

        db_name = os.getenv("DB_NAME", "consultorio_db")
        lineas = [
            f"-- Backup automatico generado: {datetime.now().isoformat()}",
            f"-- Base de datos: {db_name}",
            f"-- Sistema: Consultorio Odontológico María Luiza Balza",
            "",
            f"CREATE DATABASE IF NOT EXISTS `{db_name}` DEFAULT CHARACTER SET utf8mb4;",
            f"USE `{db_name}`;",
            "",
            "SET FOREIGN_KEY_CHECKS=0;",
            "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';",
            "SET NAMES utf8mb4;",
            "",
        ]

        for tabla in tablas:
            lineas.append(f"-- Tabla: {tabla}")
            cursor.execute(f"SHOW CREATE TABLE `{tabla}`")
            create_row = cursor.fetchone()
            create_sql = list(create_row.values())[1]
            lineas.append(f"DROP TABLE IF EXISTS `{tabla}`;")
            lineas.append(f"{create_sql};")
            lineas.append("")

            cursor.execute(f"SELECT * FROM `{tabla}`")
            rows = cursor.fetchall()
            if rows:
                cols = ", ".join([f"`{k}`" for k in rows[0].keys()])
                for row in rows:
                    vals = []
                    for v in row.values():
                        if v is None:
                            vals.append("NULL")
                        elif isinstance(v, (int, float)):
                            vals.append(str(v))
                        else:
                            escaped = str(v).replace("\\", "\\\\").replace("'", "\\'")
                            vals.append(f"'{escaped}'")
                    lineas.append(f"INSERT INTO `{tabla}` ({cols}) VALUES ({', '.join(vals)});")
                lineas.append("")

        lineas.append("SET FOREIGN_KEY_CHECKS=1;")

        contenido = "\n".join(lineas)
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(contenido)

        tamanio = os.path.getsize(ruta)

        cursor.execute(
            """INSERT INTO backups_historial (nombre_archivo, ruta, tamanio_bytes, estado)
               VALUES (%s, %s, %s, 'exitoso')""",
            (nombre, ruta, tamanio),
        )
        conn.commit()
        conn.close()

        _limpiar_backups_antiguos()
        return {"success": True, "nombre": nombre, "tamanio": tamanio, "ruta": ruta}

    except Exception as e:
        # Registrar el fallo
        try:
            conn2 = get_db_connection()
            cur2 = conn2.cursor()
            cur2.execute(
                """INSERT INTO backups_historial (nombre_archivo, ruta, tamanio_bytes, estado, error)
                   VALUES (%s, %s, 0, 'fallido', %s)""",
                (nombre, ruta, str(e)),
            )
            conn2.commit()
            conn2.close()
        except Exception:
            pass
        return {"success": False, "error": str(e)}


def _limpiar_backups_antiguos():
    """Elimina los backups más antiguos manteniendo solo los últimos MAX_BACKUPS."""
    try:
        archivos = sorted(
            [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".sql")],
            key=os.path.getmtime,
        )
        while len(archivos) > MAX_BACKUPS:
            os.remove(archivos.pop(0))
    except Exception:
        pass
