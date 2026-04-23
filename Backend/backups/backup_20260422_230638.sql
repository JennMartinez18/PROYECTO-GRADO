-- Backup automatico generado: 2026-04-22T23:06:38.567709
-- Base de datos: consultorio_db
-- Sistema: Consultorio Odontológico María Luiza Balza

CREATE DATABASE IF NOT EXISTS `consultorio_db` DEFAULT CHARACTER SET utf8mb4;
USE `consultorio_db`;

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- Tabla: backups_historial
DROP TABLE IF EXISTS `backups_historial`;
CREATE TABLE `backups_historial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_archivo` varchar(150) NOT NULL,
  `ruta` varchar(500) DEFAULT NULL,
  `tamanio_bytes` bigint DEFAULT '0',
  `estado` enum('exitoso','fallido') DEFAULT 'exitoso',
  `error` text,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `backups_historial` (`id`, `nombre_archivo`, `ruta`, `tamanio_bytes`, `estado`, `error`, `creado_en`) VALUES (1, 'backup_20260422_230447.sql', '/home/omar/Documentos/GitHub/PROYECTO-GRADO/Backend/backups/backup_20260422_230447.sql', 25703, 'exitoso', NULL, '2026-04-23 04:04:47');

-- Tabla: chat_messages
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL,
  `role` varchar(10) NOT NULL,
  `content` text NOT NULL,
  `response_time_ms` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (1, 'cddf51c3-3ba2-4990-b1fa-bb6da4be9d16', 'user', 'hola', NULL, '2026-04-20 14:01:53');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (2, 'cddf51c3-3ba2-4990-b1fa-bb6da4be9d16', 'assistant', '¡Hola! Bienvenido al Consultorio Odontológico María Luiza Balza. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', 36424, '2026-04-20 14:01:53');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (3, 'cddf51c3-3ba2-4990-b1fa-bb6da4be9d16', 'user', 'que precio tienen los planes?', NULL, '2026-04-20 14:02:53');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (4, 'cddf51c3-3ba2-4990-b1fa-bb6da4be9d16', 'assistant', 'No tengo información sobre los precios de los planes. Te recomiendo consultar en recepción sobre las opciones de financiamiento disponibles.', 4071, '2026-04-20 14:02:53');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (5, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'user', 'hola', NULL, '2026-04-20 14:30:36');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (6, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'assistant', '¡Hola! Bienvenido al Consultorio Odontológico María Luiza Balza. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', 7912, '2026-04-20 14:30:36');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (7, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'user', 'hola', NULL, '2026-04-20 14:36:18');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (8, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'assistant', '¡Hola! Bienvenido al Consultorio Odontológico María Luiza Balza. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', 1893, '2026-04-20 14:36:18');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (9, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'user', 'donde quedan ubicadfos?', NULL, '2026-04-20 14:36:29');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (10, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', 'assistant', 'Estamos ubicados en una zona de fácil acceso. Para obtener la dirección exacta y cómo llegar, puede comunicarse directamente con nuestro consultorio a través de nuestros canales de contacto.', 2080, '2026-04-20 14:36:29');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (11, '2a0ccc33-f822-4135-bdfa-692db7857c11', 'user', 'hola', NULL, '2026-04-23 03:18:29');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (12, '2a0ccc33-f822-4135-bdfa-692db7857c11', 'assistant', '¡Hola! Bienvenido al Consultorio Odontológico María Luiza Balza. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?', 8184, '2026-04-23 03:18:29');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (13, '2a0ccc33-f822-4135-bdfa-692db7857c11', 'user', 'Cómo Agendar una Cita', NULL, '2026-04-23 03:19:10');
INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `response_time_ms`, `created_at`) VALUES (14, '2a0ccc33-f822-4135-bdfa-692db7857c11', 'assistant', 'Para agendar una cita, tienes varias opciones:

1. A través de nuestro portal web: Regístrate como paciente, inicia sesión y ve a la sección "Mis Citas" donde podrás seleccionar el especialista, fecha y horario disponible.
2. Llamando por teléfono durante nuestro horario de atención.
3. Visitando directamente el consultorio.

Las citas se programan en bloques de 30 minutos y puedes ver la disponibilidad en tiempo real a través del portal.', 2364, '2026-04-23 03:19:10');

-- Tabla: chat_sessions
DROP TABLE IF EXISTS `chat_sessions`;
CREATE TABLE `chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `total_messages` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (1, 'cddf51c3-3ba2-4990-b1fa-bb6da4be9d16', '127.0.0.1', 2, '2026-04-20 14:01:24', '2026-04-20 14:02:53');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (2, 'eb8449f9-e0b2-4d30-b45e-f20a2ec132ef', '127.0.0.1', 0, '2026-04-20 14:09:45', '2026-04-20 14:09:45');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (3, '8612ec9a-dbd3-4747-ad97-b9691c556863', '127.0.0.1', 0, '2026-04-20 14:10:15', '2026-04-20 14:10:15');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (4, '058ca648-46ef-4cd3-8594-f554451cbf39', '127.0.0.1', 0, '2026-04-20 14:26:56', '2026-04-20 14:26:56');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (5, '50191a18-708b-4811-8737-49d0f7b61477', '127.0.0.1', 0, '2026-04-20 14:29:23', '2026-04-20 14:29:23');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (6, '7ffb72f7-ca62-4015-ae66-e4b942a2a8f2', '127.0.0.1', 3, '2026-04-20 14:30:35', '2026-04-20 14:36:29');
INSERT INTO `chat_sessions` (`id`, `session_id`, `ip_address`, `total_messages`, `created_at`, `updated_at`) VALUES (7, '2a0ccc33-f822-4135-bdfa-692db7857c11', '127.0.0.1', 2, '2026-04-23 03:18:28', '2026-04-23 03:19:10');

-- Tabla: citas
DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `especialidad_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('Programada','Confirmada','En_Curso','Completada','Cancelada','No_Asistio') COLLATE utf8mb4_general_ci DEFAULT 'Programada',
  `observaciones` text COLLATE utf8mb4_general_ci,
  `motivo_consulta` text COLLATE utf8mb4_general_ci,
  `consultorio` enum('1','2') COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_appointment` (`fecha`,`hora`,`usuario_id`,`consultorio`),
  KEY `especialidad_id` (`especialidad_id`),
  KEY `idx_citas_fecha` (`fecha`),
  KEY `idx_citas_paciente` (`paciente_id`),
  KEY `idx_citas_doctor` (`usuario_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `citas` (`id`, `paciente_id`, `usuario_id`, `especialidad_id`, `fecha`, `hora`, `estado`, `observaciones`, `motivo_consulta`, `consultorio`, `created_at`, `updated_at`) VALUES (15, 9, 7, 5, '2026-03-24', '8:00:00', 'Programada', 'hola', 'hola', '1', '2026-03-24 15:04:30', '2026-03-24 15:04:30');

-- Tabla: especialidades
DROP TABLE IF EXISTS `especialidades`;
CREATE TABLE `especialidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `precio_base` decimal(10,2) DEFAULT NULL,
  `duracion_minutos` int DEFAULT '60',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES (1, 'Odontología General', 'Consulta general y tratamientos básicos', '80000.00', 45, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES (2, 'Ortodoncia', 'Corrección de dientes y mordida', '150000.00', 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES (3, 'Endodoncia', 'Tratamiento de conductos', '300000.00', 90, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES (4, 'Periodoncia', 'Tratamiento de encías y periodonto', '120000.00', 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES (5, 'Cirugía Oral', 'Extracciones y cirugías menores', '200000.00', 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- Tabla: facturas
DROP TABLE IF EXISTS `facturas`;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `paciente_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `cita_id` int DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('Pendiente','Pagada','Vencida','Cancelada') COLLATE utf8mb4_general_ci DEFAULT 'Pendiente',
  `metodo_pago` enum('Efectivo','Tarjeta','Transferencia','Otro') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `usuario_id` (`usuario_id`),
  KEY `cita_id` (`cita_id`),
  KEY `idx_facturas_paciente` (`paciente_id`),
  KEY `idx_facturas_estado` (`estado`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla: historia_tratamientos
DROP TABLE IF EXISTS `historia_tratamientos`;
CREATE TABLE `historia_tratamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historia_clinica_id` int NOT NULL,
  `tratamiento_id` int NOT NULL,
  `estado` enum('Planificado','En_Progreso','Completado','Suspendido') COLLATE utf8mb4_general_ci DEFAULT 'Planificado',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `precio_aplicado` decimal(10,2) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_history_treatment` (`historia_clinica_id`,`tratamiento_id`),
  KEY `tratamiento_id` (`tratamiento_id`),
  CONSTRAINT `historia_tratamientos_ibfk_1` FOREIGN KEY (`historia_clinica_id`) REFERENCES `historias_clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historia_tratamientos_ibfk_2` FOREIGN KEY (`tratamiento_id`) REFERENCES `tratamientos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla: historias_clinicas
DROP TABLE IF EXISTS `historias_clinicas`;
CREATE TABLE `historias_clinicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int NOT NULL,
  `cita_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `fecha_atencion` date NOT NULL,
  `motivo_consulta` text COLLATE utf8mb4_general_ci NOT NULL,
  `diagnostico` text COLLATE utf8mb4_general_ci,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `recomendaciones` text COLLATE utf8mb4_general_ci,
  `proxima_cita` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_historias_paciente` (`paciente_id`),
  CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla: notificaciones_recordatorio
DROP TABLE IF EXISTS `notificaciones_recordatorio`;
CREATE TABLE `notificaciones_recordatorio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cita_id` int NOT NULL,
  `telefono` varchar(25) DEFAULT NULL,
  `tipo` enum('recordatorio_24h','recordatorio_1h','confirmacion') DEFAULT 'recordatorio_24h',
  `estado` enum('pendiente','enviado','fallido') DEFAULT 'pendiente',
  `mensaje_error` text,
  `fecha_envio` datetime DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  CONSTRAINT `notificaciones_recordatorio_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: pacientes
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `genero` enum('M','F','Otro') COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_sangre` varchar(5) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contacto_emergencia` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono_emergencia` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `idx_pacientes_cedula` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `cedula`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `genero`, `tipo_sangre`, `contacto_emergencia`, `telefono_emergencia`, `activo`, `created_at`, `updated_at`) VALUES (9, 'Iber', 'masco', '1049264825', '2003-05-25', '3132172050', 'ibermasco5@gmail.com', 'Cra 8b 51b 82', 'M', 'AB+', '03232323232', '03232323232', 1, '2026-03-24 14:52:20', '2026-03-24 14:52:20');
INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `cedula`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `genero`, `tipo_sangre`, `contacto_emergencia`, `telefono_emergencia`, `activo`, `created_at`, `updated_at`) VALUES (10, 'omar ', 'tobon', '10020335877', '2026-03-14', '3012558104', 'omar@gmail.com', 'cra 8b 51b 82', 'M', 'O-', '2222222222222', '333333333333', 1, '2026-03-24 15:22:45', '2026-03-24 15:22:45');

-- Tabla: roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES (1, 'Administrador', 'Acceso completo al sistema', '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES (2, 'Paciente', 'Usuario paciente del consultorio', '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES (3, 'Recepcionista', 'Personal de recepción y agendamiento', '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES (4, 'Odontólogo', 'Profesional odontólogo del consultorio', '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- Tabla: tratamientos
DROP TABLE IF EXISTS `tratamientos`;
CREATE TABLE `tratamientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `precio` decimal(10,2) NOT NULL,
  `duracion_sesiones` int DEFAULT '1',
  `especialidad_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `especialidad_id` (`especialidad_id`),
  CONSTRAINT `tratamientos_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (1, 'Consulta General', 'Revisión general y diagnóstico', '80000.00', 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (2, 'Limpieza Dental', 'Profilaxis y limpieza dental', '60000.00', 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (3, 'Resina Dental', 'Restauración con resina compuesta', '120000.00', 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (4, 'Calza Dental', 'Restauración con amalgama', '100000.00', 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (5, 'Brackets Metálicos', 'Instalación de ortodoncia metálica', '1500000.00', 1, 2, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (6, 'Control Ortodoncia', 'Revisión y ajuste de brackets', '80000.00', 1, 2, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (7, 'Endodoncia Anterior', 'Tratamiento de conducto diente anterior', '250000.00', 2, 3, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (8, 'Endodoncia Molar', 'Tratamiento de conducto en molar', '350000.00', 3, 3, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (9, 'Curetaje Dental', 'Limpieza profunda de encías', '150000.00', 1, 4, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (10, 'Tratamiento Periodontal', 'Terapia periodontal completa', '300000.00', 3, 4, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (11, 'Extracción Simple', 'Extracción dental básica', '100000.00', 1, 5, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');
INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES (12, 'Extracción Quirúrgica', 'Extracción compleja o cordal', '200000.00', 1, 5, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- Tabla: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cedula` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `rol_id` (`rol_id`),
  KEY `idx_usuarios_email` (`email`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES (1, 'Admin', 'Sistema', 'admin@gmail.com', '$2b$12$lxcwv3XQ6N5WGgUTB0xoY.LQzohTqDKCI0r2TFQdP9ByJkvXd7/.C', '3001234567', '1234567890', 1, 1, '2025-09-13 22:57:08', '2026-03-19 14:36:04');
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES (4, 'Recepecion', 'Recepecion', 'recepcion@gmail.com', '$2b$12$qUAJNfAwCytq5oEtnU/3MuMcEEer6Haezwa3RWYNscYQYg4h7LN/C', '3005555555', '1111222333', 3, 1, '2025-09-13 22:57:08', '2026-03-18 15:48:24');
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES (7, ' odontologo', ' rafael hector', 'odontologo@gmail.com', '$2b$12$QSaHih2.EwwJi9c3vWmEmekburjf5hXzifVlIThyrTZf7LytthdUG', '3001112233', '9876543210', 4, 1, '2026-03-18 14:20:03', '2026-03-24 15:38:38');
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES (13, 'Iber', 'masco', 'ibermasco5@gmail.com', '$2b$12$neBqgW4fOqg7dHUdq0I.Y.u77Hv0YYZUV2qlqqlNimjobR1L2snYC', '3132172050', '1049264825', 2, 1, '2026-03-24 14:52:20', '2026-03-24 15:04:12');
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES (14, 'omar ', 'tobon', 'omar@gmail.com', '$2b$12$dyn6fRYVfOsZaCt.H6oKvukcJS31a4/BAcxf7lgicXpHsx0/Ei5hS', '3012558104', '10020335877', 2, 1, '2026-03-24 15:22:46', '2026-03-24 15:23:18');

SET FOREIGN_KEY_CHECKS=1;