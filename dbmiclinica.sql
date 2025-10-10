-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-10-2025 a las 23:04:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbmiclinica`
--

CREATE DATABASE IF NOT EXISTS `dbmiclinica`;
USE `dbmiclinica`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `sede_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `estado` enum('programada','confirmada','cancelada','atendida','no_show') DEFAULT 'programada',
  `creado_por` int(11) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`, `creado_en`) VALUES
(1, 1, 1, 1, '2025-10-10', '10:30:00', 'Consulta cardiológica', 'confirmada', 2, '2025-10-02 21:43:02'),
(2, 2, 2, 1, '2025-10-11', '09:00:00', 'Chequeo pediátrico', 'programada', 2, '2025-10-02 21:43:02'),
(3, 4, 2, 1, '2025-10-13', '11:00:00', 'REVICION ANUAL', 'programada', NULL, '2025-10-07 20:14:53'),
(5, 4, 2, 1, '2025-10-07', '08:00:00', 'ASDF', 'programada', NULL, '2025-10-07 20:46:12'),
(7, 1, 2, 1, '2025-10-14', '09:00:00', 'gggg', 'programada', NULL, '2025-10-08 06:17:08'),
(8, 5, 3, 1, '2025-10-13', '11:00:00', 'asdffff', 'programada', NULL, '2025-10-08 06:18:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id`, `nombre`, `apellido`, `especialidad`, `telefono`, `email`, `estado`, `creado_en`) VALUES
(1, 'María', 'Salazar', 'Cardiología', '987654321', 'maria.salazar@clinica.com', 1, '2025-10-02 21:43:02'),
(2, 'Luis', 'Ramírez', 'Pediatría', '912345678', 'luis.ramirez@clinica.com', 1, '2025-10-02 21:43:02'),
(3, 'test', 'doc', 'Estomatologia', '999999', 'test@doc.com', 0, '2025-10-07 17:26:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medico_sede`
--

CREATE TABLE `medico_sede` (
  `id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `sede_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medico_sede`
--

INSERT INTO `medico_sede` (`id`, `medico_id`, `sede_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `dni`, `nombre`, `apellido`, `telefono`, `email`, `fecha_nacimiento`, `direccion`, `creado_en`) VALUES
(1, '12345678', 'Juan', 'Pérez Gómez', '999888777', 'juan.perez@gmail.com', '1985-05-20', 'Calle Lima 123', '2025-10-02 21:43:02'),
(2, '87654321', 'Ana', 'Torres Ruiz', '988777666', 'ana.torres@gmail.com', '1990-09-15', 'Av. Perú 456', '2025-10-02 21:43:02'),
(4, '88888888', 'test', 'test', '999999999', 'test@admin.com', '2000-05-01', 'Av. test 123', '2025-10-07 16:41:08'),
(5, '1111111111', 'view', 'test', '676667767', 'view@admin.com', '1999-12-07', 'AV. TEST 747', '2025-10-07 16:56:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_atenciones`
--

CREATE TABLE `historial_atenciones` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `cita_id` int(11) DEFAULT NULL,
  `medico_id` int(11) NOT NULL,
  `fecha_atencion` date NOT NULL,
  `diagnostico` text NOT NULL,
  `observaciones` text DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `creado_por` int(11) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes`
--

CREATE TABLE `sedes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sedes`
--

INSERT INTO `sedes` (`id`, `nombre`, `direccion`, `telefono`, `email`, `estado`, `creado_en`) VALUES
(1, 'Clínica San Miguel', 'Av. Siempre Viva 123, San Miguel, Lima', '014567890', 'contacto@sanmiguel.com', 1, '2025-10-02 21:43:01'),
(2, 'Clínica Miraflores', 'Av. Larco 456, Miraflores, Lima', '014567891', 'contacto@miraflores.com', 1, '2025-10-02 21:43:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','recepcion') NOT NULL DEFAULT 'recepcion',
  `estado` tinyint(1) DEFAULT 1,
  `sede_id` int(11) DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `estado`, `sede_id`, `creado_en`) VALUES
(2, 'Recepción San Miguel', 'recepcion1@clinica.com', '123456', 'recepcion', 1, 1, '2025-10-02 21:43:02'),
(3, 'Recepción Miraflores', 'recepcion2@clinica.com', '123456', 'recepcion', 1, 2, '2025-10-02 21:43:02'),
(5, 'Admin General', 'admin@clinica.com', '$2b$10$3r9.7m0XcYVJf5OBnlZtN.RDk9CETXM0hLk5M6t0v0ghp4glf6zYm', 'admin', 1, 1, '2025-10-03 03:35:33'),
(6, 'Admin General', 'admin@admin.com', '$2b$10$WGgDoYIjdWgVVxJmn8CI1.uuxu96JjkQSjtlKZtmXmcsN2/EkU/Sm', 'admin', 1, 1, '2025-10-03 04:26:55');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cita` (`medico_id`,`sede_id`,`fecha`,`hora`),
  ADD KEY `paciente_id` (`paciente_id`),
  ADD KEY `sede_id` (`sede_id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `historial_atenciones`
--
ALTER TABLE `historial_atenciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_id` (`paciente_id`),
  ADD KEY `cita_id` (`cita_id`),
  ADD KEY `medico_id` (`medico_id`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `medico_sede`
--
ALTER TABLE `medico_sede`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `medico_id` (`medico_id`,`sede_id`),
  ADD KEY `sede_id` (`sede_id`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `sedes`
--
ALTER TABLE `sedes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `sede_id` (`sede_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `historial_atenciones`
--
ALTER TABLE `historial_atenciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medicos`
--
ALTER TABLE `medicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `medico_sede`
--
ALTER TABLE `medico_sede`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sedes`
--
ALTER TABLE `sedes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`),
  ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`),
  ADD CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `historial_atenciones`
--
ALTER TABLE `historial_atenciones`
  ADD CONSTRAINT `historial_atenciones_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  ADD CONSTRAINT `historial_atenciones_ibfk_2` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  ADD CONSTRAINT `historial_atenciones_ibfk_3` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`),
  ADD CONSTRAINT `historial_atenciones_ibfk_4` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `medico_sede`
--
ALTER TABLE `medico_sede`
  ADD CONSTRAINT `medico_sede_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`),
  ADD CONSTRAINT `medico_sede_ibfk_2` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- Nota: Para usar autenticación moderna en MySQL 8+, descomentar estas líneas:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
-- FLUSH PRIVILEGES;