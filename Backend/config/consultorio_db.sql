-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-03-2026 a las 02:00:01
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `consultorio_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `especialidad_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('Programada','Confirmada','En_Curso','Completada','Cancelada','No_Asistio') DEFAULT 'Programada',
  `observaciones` text DEFAULT NULL,
  `motivo_consulta` text DEFAULT NULL,
  `consultorio` enum('1','2') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `paciente_id`, `usuario_id`, `especialidad_id`, `fecha`, `hora`, `estado`, `observaciones`, `motivo_consulta`, `consultorio`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-11-24', '09:00:00', 'Programada', 'consulta general ', 'Limpieza general ', '1', '2025-11-25 01:27:06', '2025-11-25 01:27:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidades`
--

CREATE TABLE `especialidades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_base` decimal(10,2) DEFAULT NULL,
  `duracion_minutos` int(11) DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especialidades`
--

INSERT INTO `especialidades` (`id`, `nombre`, `descripcion`, `precio_base`, `duracion_minutos`, `created_at`, `updated_at`) VALUES
(1, 'Odontología General', 'Consulta general y tratamientos básicos', 80000.00, 45, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(2, 'Ortodoncia', 'Corrección de dientes y mordida', 150000.00, 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(3, 'Endodoncia', 'Tratamiento de conductos', 300000.00, 90, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(4, 'Periodoncia', 'Tratamiento de encías y periodonto', 120000.00, 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(5, 'Cirugía Oral', 'Extracciones y cirugías menores', 200000.00, 60, '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `numero_factura` varchar(20) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cita_id` int(11) DEFAULT NULL,
  `fecha_emision` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('Pendiente','Pagada','Vencida','Cancelada') DEFAULT 'Pendiente',
  `metodo_pago` enum('Efectivo','Tarjeta','Transferencia','Otro') DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`id`, `numero_factura`, `paciente_id`, `usuario_id`, `cita_id`, `fecha_emision`, `total`, `estado`, `metodo_pago`, `fecha_pago`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 'FAC-255820', 1, 1, 1, '2025-11-25', 300000.00, 'Pagada', 'Efectivo', '2025-11-24', 'Todo ok ', '2025-11-25 01:31:22', '2025-11-25 01:31:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historias_clinicas`
--

CREATE TABLE `historias_clinicas` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `cita_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_atencion` date NOT NULL,
  `motivo_consulta` text NOT NULL,
  `diagnostico` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `proxima_cita` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historias_clinicas`
--

INSERT INTO `historias_clinicas` (`id`, `paciente_id`, `cita_id`, `usuario_id`, `fecha_atencion`, `motivo_consulta`, `diagnostico`, `observaciones`, `recomendaciones`, `proxima_cita`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-11-25', 'limpieza general', 'Se encontró varias caries en diferentes muelas', 'Mucha sociedad', 'lavar mas los dientes', '0000-00-00', '2025-11-25 01:28:50', '2025-11-25 01:28:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historia_tratamientos`
--

CREATE TABLE `historia_tratamientos` (
  `id` int(11) NOT NULL,
  `historia_clinica_id` int(11) NOT NULL,
  `tratamiento_id` int(11) NOT NULL,
  `estado` enum('Planificado','En_Progreso','Completado','Suspendido') DEFAULT 'Planificado',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `precio_aplicado` decimal(10,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `genero` enum('M','F','Otro') NOT NULL,
  `tipo_sangre` varchar(5) DEFAULT NULL,
  `contacto_emergencia` varchar(100) DEFAULT NULL,
  `telefono_emergencia` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre`, `apellido`, `cedula`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `genero`, `tipo_sangre`, `contacto_emergencia`, `telefono_emergencia`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'omar', 'martinez', '1002033577', '2025-11-05', '3022457064', 'Omartobon2002@gmail.com', 'cra 8b', 'M', 'A+', '32323232323', '3022457064', 1, '2025-11-25 01:26:08', '2025-11-25 01:26:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'Acceso completo al sistema', '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(2, 'Paciente', 'Usuario paciente del consultorio', '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(3, 'Recepcionista', 'Personal de recepción y agendamiento', '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(4, 'Odontólogo', 'Profesional odontólogo del consultorio', '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tratamientos`
--

CREATE TABLE `tratamientos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion_sesiones` int(11) DEFAULT 1,
  `especialidad_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tratamientos`
--

INSERT INTO `tratamientos` (`id`, `nombre`, `descripcion`, `precio`, `duracion_sesiones`, `especialidad_id`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Consulta General', 'Revisión general y diagnóstico', 80000.00, 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(2, 'Limpieza Dental', 'Profilaxis y limpieza dental', 60000.00, 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(3, 'Resina Dental', 'Restauración con resina compuesta', 120000.00, 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(4, 'Calza Dental', 'Restauración con amalgama', 100000.00, 1, 1, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(5, 'Brackets Metálicos', 'Instalación de ortodoncia metálica', 1500000.00, 1, 2, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(6, 'Control Ortodoncia', 'Revisión y ajuste de brackets', 80000.00, 1, 2, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(7, 'Endodoncia Anterior', 'Tratamiento de conducto diente anterior', 250000.00, 2, 3, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(8, 'Endodoncia Molar', 'Tratamiento de conducto en molar', 350000.00, 3, 3, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(9, 'Curetaje Dental', 'Limpieza profunda de encías', 150000.00, 1, 4, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(10, 'Tratamiento Periodontal', 'Terapia periodontal completa', 300000.00, 3, 4, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(11, 'Extracción Simple', 'Extracción dental básica', 100000.00, 1, 5, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08'),
(12, 'Extracción Quirúrgica', 'Extracción compleja o cordal', 200000.00, 1, 5, 1, '2025-09-13 22:57:08', '2025-09-13 22:57:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `rol_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `password`, `telefono`, `cedula`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Sistema', 'admin@gmail.com', 'admin123', '3001234567', '1234567890', 1, 1, '2025-09-13 22:57:08', '2025-11-25 01:20:07'),
(4, 'María', 'Rodríguez', 'recepcion@gmail.com', 'recepcion123', '3005555555', '1111222333', 3, 1, '2025-09-13 22:57:08', '2025-11-25 01:20:00'),
(5, 'omar', 'martinez', 'Omartobon2002@gmail.com', '1002033577', '3022457064', '1002033577', 2, 1, '2025-11-25 01:26:08', '2025-11-25 01:26:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_appointment` (`fecha`,`hora`,`usuario_id`,`consultorio`),
  ADD KEY `especialidad_id` (`especialidad_id`),
  ADD KEY `idx_citas_fecha` (`fecha`),
  ADD KEY `idx_citas_paciente` (`paciente_id`),
  ADD KEY `idx_citas_doctor` (`usuario_id`);

--
-- Indices de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `cita_id` (`cita_id`),
  ADD KEY `idx_facturas_paciente` (`paciente_id`),
  ADD KEY `idx_facturas_estado` (`estado`);

--
-- Indices de la tabla `historias_clinicas`
--
ALTER TABLE `historias_clinicas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cita_id` (`cita_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_historias_paciente` (`paciente_id`);

--
-- Indices de la tabla `historia_tratamientos`
--
ALTER TABLE `historia_tratamientos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_history_treatment` (`historia_clinica_id`,`tratamiento_id`),
  ADD KEY `tratamiento_id` (`tratamiento_id`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `idx_pacientes_cedula` (`cedula`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `especialidad_id` (`especialidad_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `rol_id` (`rol_id`),
  ADD KEY `idx_usuarios_email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `especialidades`
--
ALTER TABLE `especialidades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `historias_clinicas`
--
ALTER TABLE `historias_clinicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `historia_tratamientos`
--
ALTER TABLE `historia_tratamientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  ADD CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`);

--
-- Filtros para la tabla `historias_clinicas`
--
ALTER TABLE `historias_clinicas`
  ADD CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  ADD CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  ADD CONSTRAINT `historias_clinicas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `historia_tratamientos`
--
ALTER TABLE `historia_tratamientos`
  ADD CONSTRAINT `historia_tratamientos_ibfk_1` FOREIGN KEY (`historia_clinica_id`) REFERENCES `historias_clinicas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historia_tratamientos_ibfk_2` FOREIGN KEY (`tratamiento_id`) REFERENCES `tratamientos` (`id`);

--
-- Filtros para la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  ADD CONSTRAINT `tratamientos_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
