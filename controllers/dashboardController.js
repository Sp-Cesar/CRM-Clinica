const conexion = require('../models/db');

exports.verDashboard = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Consulta para obtener estadísticas generales
  const sqlEstadisticas = `
    SELECT 
      (SELECT COUNT(*) FROM pacientes) as total_pacientes,
      (SELECT COUNT(*) FROM medicos WHERE estado = 1) as total_medicos,
      (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) as citas_hoy,
      (SELECT COUNT(*) FROM citas WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) as citas_mes,
      (SELECT COUNT(*) FROM citas WHERE estado = 'programada' AND fecha >= CURDATE()) as citas_pendientes
  `;

  // Consulta para últimos pacientes
  const sqlUltimosPacientes = `
    SELECT 
      p.nombre,
      p.apellido,
      p.dni,
      DATE_FORMAT(p.creado_en, '%d/%m/%Y') as fecha_registro
    FROM pacientes p
    ORDER BY p.creado_en DESC
    LIMIT 5
  `;

  // Consulta para próximas citas
  const sqlProximasCitas = `
    SELECT 
      c.fecha,
      c.hora,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    WHERE c.fecha >= CURDATE()
    ORDER BY c.fecha ASC, c.hora ASC
    LIMIT 5
  `;

  // Ejecutar consultas
  conexion.query(sqlEstadisticas, (err1, estadisticas) => {
    if (err1) {
      console.error('Error al obtener estadísticas:', err1);
      estadisticas = [{
        total_pacientes: 0,
        total_medicos: 0,
        citas_hoy: 0,
        citas_mes: 0,
        citas_pendientes: 0
      }];
    }

    conexion.query(sqlUltimosPacientes, (err2, ultimosPacientes) => {
      if (err2) {
        console.error('Error al obtener últimos pacientes:', err2);
        ultimosPacientes = [];
      }

      conexion.query(sqlProximasCitas, (err3, proximasCitas) => {
        if (err3) {
          console.error('Error al obtener próximas citas:', err3);
          proximasCitas = [];
        }

        res.render('pages/dashboard/main', {
          title: 'Dashboard',
          nombre: req.session.nombre,
          estadisticas: estadisticas[0],
          ultimosPacientes,
          proximasCitas,
          layout: 'layouts/main'
        });
      });
    });
  });
};

