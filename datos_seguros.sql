-- Datos realistas SEGUROS para el CRM de Clínica
-- Este archivo usa solo los datos que realmente existen en la base de datos

-- 1. Insertar médicos adicionales (estos se insertarán con IDs automáticos)
INSERT INTO `medicos` (`nombre`, `apellido`, `especialidad`, `telefono`, `email`, `estado`) VALUES
('Carlos', 'Mendoza', 'Medicina General', '987654321', 'carlos.mendoza@clinica.com', 1),
('Elena', 'Vargas', 'Ginecología', '912345678', 'elena.vargas@clinica.com', 1),
('Roberto', 'Silva', 'Traumatología', '923456789', 'roberto.silva@clinica.com', 1),
('Patricia', 'González', 'Dermatología', '934567890', 'patricia.gonzalez@clinica.com', 1),
('Miguel', 'Torres', 'Neurología', '945678901', 'miguel.torres@clinica.com', 1),
('Sofia', 'Herrera', 'Psiquiatría', '956789012', 'sofia.herrera@clinica.com', 1),
('Diego', 'Morales', 'Urología', '967890123', 'diego.morales@clinica.com', 1),
('Carmen', 'Jiménez', 'Oftalmología', '978901234', 'carmen.jimenez@clinica.com', 1);

-- 2. Insertar pacientes con DNIs únicos
INSERT INTO `pacientes` (`dni`, `nombre`, `apellido`, `telefono`, `email`, `fecha_nacimiento`, `direccion`) VALUES
('12345679', 'Adrián', 'Ramos Barzola', '999888777', 'adrian.ramos@gmail.com', '1985-05-20', 'Av. Javier Prado Este 123, San Isidro'),
('87654322', 'María Elena', 'Torres Ruiz', '988777666', 'maria.torres@gmail.com', '1990-09-15', 'Jr. Lampa 456, Cercado de Lima'),
('11223345', 'Francisco', 'Uy', '977666555', 'francisco.uy@gmail.com', '1982-12-03', 'Av. Arequipa 789, Miraflores'),
('55667789', 'Ana Lucía', 'García Mendoza', '966555444', 'ana.garcia@gmail.com', '1995-07-18', 'Calle Las Flores 321, Surco'),
('99887767', 'Luis Alberto', 'Vásquez Silva', '955444333', 'luis.vasquez@gmail.com', '1988-03-25', 'Av. Brasil 654, Magdalena'),
('44332212', 'Carmen Rosa', 'López Herrera', '944333222', 'carmen.lopez@gmail.com', '1992-11-12', 'Jr. Unión 987, Rímac'),
('77889901', 'Roberto Carlos', 'Martínez Díaz', '933222111', 'roberto.martinez@gmail.com', '1987-08-30', 'Av. Universitaria 147, San Miguel'),
('22334456', 'Patricia Isabel', 'Rodríguez Vega', '922111000', 'patricia.rodriguez@gmail.com', '1993-04-07', 'Calle Los Rosales 258, La Molina'),
('66778890', 'Miguel Ángel', 'Castro Flores', '911000999', 'miguel.castro@gmail.com', '1984-01-14', 'Av. Primavera 369, Chorrillos'),
('33445567', 'Sofia Alejandra', 'Morales Paredes', '900999888', 'sofia.morales@gmail.com', '1996-06-22', 'Jr. Comercio 741, Barranco');

-- 3. Insertar citas médicas realistas (fechas futuras desde 13/10/2025)
-- Citas para octubre-noviembre 2025 - Pacientes existentes con médicos nuevos
INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-15', '09:00:00', 'Control cardiológico anual', 'confirmada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345678' AND m.nombre = 'María' AND m.apellido = 'Salazar' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-16', '10:00:00', 'Control pediátrico - niño de 5 años', 'confirmada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654321' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-17', '08:30:00', 'Chequeo médico general', 'confirmada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '88888888' AND m.nombre = 'Carlos' AND m.apellido = 'Mendoza' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-18', '14:00:00', 'Consulta ginecológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '1111111111' AND m.nombre = 'Elena' AND m.apellido = 'Vargas' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-20', '11:00:00', 'Consulta traumatológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345678' AND m.nombre = 'Roberto' AND m.apellido = 'Silva' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-22', '15:30:00', 'Revisión dermatológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654321' AND m.nombre = 'Patricia' AND m.apellido = 'González' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-25', '09:30:00', 'Consulta neurológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '88888888' AND m.nombre = 'Miguel' AND m.apellido = 'Torres' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-28', '13:00:00', 'Consulta psiquiátrica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '1111111111' AND m.nombre = 'Sofia' AND m.apellido = 'Herrera' LIMIT 1;

-- Citas para los nuevos pacientes (fechas futuras desde 13/10/2025)
INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-19', '10:00:00', 'Consulta cardiológica inicial', 'confirmada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345679' AND m.nombre = 'María' AND m.apellido = 'Salazar' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-21', '14:30:00', 'Control pediátrico familiar', 'confirmada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654322' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-23', '11:30:00', 'Chequeo médico general', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '11223345' AND m.nombre = 'Carlos' AND m.apellido = 'Mendoza' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-24', '16:00:00', 'Consulta ginecológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '55667789' AND m.nombre = 'Elena' AND m.apellido = 'Vargas' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-26', '08:00:00', 'Consulta traumatológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '99887767' AND m.nombre = 'Roberto' AND m.apellido = 'Silva' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-27', '12:00:00', 'Revisión dermatológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '44332212' AND m.nombre = 'Patricia' AND m.apellido = 'González' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-29', '15:00:00', 'Consulta neurológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '77889901' AND m.nombre = 'Miguel' AND m.apellido = 'Torres' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-30', '10:30:00', 'Consulta psiquiátrica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '22334456' AND m.nombre = 'Sofia' AND m.apellido = 'Herrera' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-10-31', '13:30:00', 'Consulta urológica', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '66778890' AND m.nombre = 'Diego' AND m.apellido = 'Morales' LIMIT 1;

INSERT INTO `citas` (`paciente_id`, `medico_id`, `sede_id`, `fecha`, `hora`, `motivo`, `estado`, `creado_por`) 
SELECT p.id, m.id, 1, '2025-11-01', '09:00:00', 'Examen oftalmológico', 'programada', 2
FROM pacientes p, medicos m 
WHERE p.dni = '33445567' AND m.nombre = 'Carmen' AND m.apellido = 'Jiménez' LIMIT 1;

-- 4. Insertar historial médico extenso usando los nuevos médicos
-- Historial para pacientes existentes con médicos nuevos
INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-15', 'Hipertensión arterial controlada', 'Paciente con buen control de la presión arterial. Sin síntomas de alarma.', 'Continuar con losartán 50mg diario. Control en 3 meses.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345678' AND m.nombre = 'María' AND m.apellido = 'Salazar' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-11-20', 'Arritmia cardíaca leve', 'Extrasístoles ocasionales sin repercusión hemodinámica.', 'Propranolol 20mg diario. Evitar cafeína.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345678' AND m.nombre = 'María' AND m.apellido = 'Salazar' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-16', 'Control pediátrico normal', 'Niño de 5 años con desarrollo normal. Vacunas al día.', 'Continuar con alimentación balanceada. Próximo control en 6 meses.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654321' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-10-15', 'Bronquitis aguda', 'Cuadro respiratorio con tos productiva. Sin fiebre.', 'Amoxicilina 500mg cada 8h por 7 días. Expectorante.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654321' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-17', 'Diabetes tipo 2 controlada', 'Paciente con buen control glucémico. HbA1c: 6.8%', 'Continuar con metformina 850mg dos veces al día. Dieta y ejercicio.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '88888888' AND m.nombre = 'Carlos' AND m.apellido = 'Mendoza' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-11-10', 'Retinopatía diabética incipiente', 'Cambios microvasculares leves en fondo de ojo.', 'Control oftalmológico cada 6 meses. Control estricto de glucosa.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '88888888' AND m.nombre = 'Carmen' AND m.apellido = 'Jiménez' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-18', 'Caries dental múltiple', 'Múltiples lesiones cariosas en molares. Sin dolor.', 'Tratamiento restaurador. Higiene oral mejorada.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '1111111111' AND m.nombre = 'test' AND m.apellido = 'doc' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-10-25', 'Gingivitis crónica', 'Inflamación gingival generalizada. Placa bacteriana abundante.', 'Limpieza profesional. Cepillado correcto. Enjuague con clorhexidina.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '1111111111' AND m.nombre = 'test' AND m.apellido = 'doc' LIMIT 1;

-- Historial para nuevos pacientes (usando médicos nuevos con especialidades apropiadas)
INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-20', 'Hipertensión arterial grado I', 'Presión arterial elevada en múltiples mediciones.', 'Enalapril 10mg diario. Dieta baja en sodio. Control en 1 mes.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345679' AND m.nombre = 'María' AND m.apellido = 'Salazar' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-11-15', 'Ansiedad generalizada', 'Síntomas de ansiedad relacionados con trabajo. Sin crisis de pánico.', 'Sertralina 50mg diario. Terapia psicológica. Técnicas de relajación.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '12345679' AND m.nombre = 'Sofia' AND m.apellido = 'Herrera' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-22', 'Control pediátrico normal', 'Niña de 4 años con desarrollo normal. Peso y talla adecuados.', 'Continuar con alimentación balanceada. Vacunas al día.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654322' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-10-18', 'Otitis media aguda', 'Dolor de oído derecho con fiebre. Tímpano enrojecido.', 'Amoxicilina 40mg/kg/día por 10 días. Analgésicos.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '87654322' AND m.nombre = 'Luis' AND m.apellido = 'Ramírez' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-25', 'Migraña crónica', 'Cefaleas frecuentes con características migrañosas. Sin aura.', 'Topiramato 25mg diario. Sumatriptán como rescate. Evitar desencadenantes.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '11223345' AND m.nombre = 'Miguel' AND m.apellido = 'Torres' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-11-30', 'Reflujo gastroesofágico', 'Síntomas de acidez y regurgitación postprandial.', 'Omeprazol 20mg diario. Modificaciones dietéticas. Elevar cabecera de cama.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '11223345' AND m.nombre = 'Carlos' AND m.apellido = 'Mendoza' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-28', 'Acné moderado', 'Lesiones inflamatorias en cara y espalda. Sin cicatrices.', 'Peróxido de benzoilo 5% tópico. Doxiciclina 100mg diario por 3 meses.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '55667789' AND m.nombre = 'Patricia' AND m.apellido = 'González' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-10-20', 'Dermatitis seborreica', 'Lesiones descamativas en cuero cabelludo y pliegues.', 'Ketoconazol 2% champú. Hidrocortisona tópica en lesiones activas.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '55667789' AND m.nombre = 'Patricia' AND m.apellido = 'González' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-12-30', 'Lumbalgia crónica', 'Dolor lumbar de características mecánicas. Sin signos de alarma neurológica.', 'Fisioterapia y ejercicios de fortalecimiento. Ibuprofeno 400mg según necesidad.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '99887767' AND m.nombre = 'Roberto' AND m.apellido = 'Silva' LIMIT 1;

INSERT INTO `historial_atenciones` (`paciente_id`, `cita_id`, `medico_id`, `fecha_atencion`, `diagnostico`, `observaciones`, `tratamiento`, `creado_por`)
SELECT p.id, NULL, m.id, '2024-11-25', 'Hernia discal L4-L5', 'Protrusión discal que comprime raíz L5. Dolor radicular.', 'Fisioterapia especializada. Gabapentina 300mg tres veces al día.', 2
FROM pacientes p, medicos m 
WHERE p.dni = '99887767' AND m.nombre = 'Roberto' AND m.apellido = 'Silva' LIMIT 1;

-- 5. Actualizar médico_sede para médicos existentes (solo si no existe)
INSERT IGNORE INTO `medico_sede` (`medico_id`, `sede_id`) 
SELECT m.id, 2 
FROM medicos m 
WHERE m.nombre = 'María' AND m.apellido = 'Salazar'
LIMIT 1;

INSERT IGNORE INTO `medico_sede` (`medico_id`, `sede_id`) 
SELECT m.id, 2 
FROM medicos m 
WHERE m.nombre = 'Luis' AND m.apellido = 'Ramírez'
LIMIT 1;
