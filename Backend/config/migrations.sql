-- ============================================================
-- MIGRACIÓN: Tablas para HU-02 (Recordatorios WhatsApp) y
--            HU-06 (Historial de Backups)
-- ============================================================

-- Tabla de notificaciones de recordatorio (HU-02)
CREATE TABLE IF NOT EXISTS notificaciones_recordatorio (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    cita_id         INT NOT NULL,
    telefono        VARCHAR(25),
    tipo            ENUM('recordatorio_24h', 'recordatorio_1h', 'confirmacion') DEFAULT 'recordatorio_24h',
    estado          ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente',
    mensaje_error   TEXT,
    fecha_envio     DATETIME,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
);

-- Tabla de historial de backups (HU-06)
CREATE TABLE IF NOT EXISTS backups_historial (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo  VARCHAR(150) NOT NULL,
    ruta            VARCHAR(500),
    tamanio_bytes   BIGINT DEFAULT 0,
    estado          ENUM('exitoso', 'fallido') DEFAULT 'exitoso',
    error           TEXT,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
