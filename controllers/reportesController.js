const conexion = require('../models/db');

// Ver página de reportes
exports.verReportes = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Obtener estadísticas generales
  const sqlEstadisticas = `
    SELECT 
      (SELECT COUNT(*) FROM pacientes) as total_pacientes,
      (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) as citas_hoy,
      (SELECT COUNT(*) FROM medicos WHERE estado = 1) as medicos_activos,
      (SELECT COUNT(*) FROM historial_atenciones WHERE MONTH(fecha_atencion) = MONTH(CURDATE()) AND YEAR(fecha_atencion) = YEAR(CURDATE())) as atenciones_mes
  `;

  conexion.query(sqlEstadisticas, (error, results) => {
    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.render('pages/reportes/index', {
        title: 'Reportes',
        nombre: req.session.nombre,
        estadisticas: {
          total_pacientes: 0,
          citas_hoy: 0,
          medicos_activos: 0,
          atenciones_mes: 0
        },
        layout: 'layouts/main'
      });
    }

    res.render('pages/reportes/index', {
      title: 'Reportes',
      nombre: req.session.nombre,
      estadisticas: results[0],
      layout: 'layouts/main'
    });
  });
};

// Reporte diario de citas
exports.reporteDiario = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      c.id,
      c.hora,
      c.motivo,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni,
      p.telefono AS paciente_telefono,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      s.nombre AS sede_nombre
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    INNER JOIN sedes s ON c.sede_id = s.id
    WHERE c.fecha = ?
    ORDER BY c.hora ASC
  `;

  conexion.query(sql, [fecha], (error, results) => {
    if (error) {
      console.error('Error al generar reporte diario:', error);
      return res.render('pages/reportes/diario', {
        title: 'Reporte Diario',
        nombre: req.session.nombre,
        citas: [],
        fecha,
        totalCitas: 0,
        citasProgramadas: 0,
        citasConfirmadas: 0,
        citasAtendidas: 0,
        citasCanceladas: 0,
        layout: 'layouts/main'
      });
    }

    // Estadísticas
    const totalCitas = results.length;
    const citasProgramadas = results.filter(c => c.estado === 'programada').length;
    const citasConfirmadas = results.filter(c => c.estado === 'confirmada').length;
    const citasAtendidas = results.filter(c => c.estado === 'atendida').length;
    const citasCanceladas = results.filter(c => c.estado === 'cancelada').length;

    res.render('pages/reportes/diario', {
      title: 'Reporte Diario',
      nombre: req.session.nombre,
      citas: results,
      fecha,
      totalCitas,
      citasProgramadas,
      citasConfirmadas,
      citasAtendidas,
      citasCanceladas,
      layout: 'layouts/main'
    });
  });
};

// Reporte semanal por médico
exports.reporteSemanal = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Calcular fecha de inicio y fin de la semana
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const fechaInicio = req.query.fecha_inicio || lunes.toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || domingo.toISOString().split('T')[0];

  const sql = `
    SELECT 
      m.id AS medico_id,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad,
      COUNT(c.id) AS total_citas,
      SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) AS programadas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) AS atendidas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      SUM(CASE WHEN c.estado = 'no_show' THEN 1 ELSE 0 END) AS no_show
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha BETWEEN ? AND ?
    GROUP BY m.id, m.nombre, m.apellido, m.especialidad
    ORDER BY total_citas DESC
  `;

  conexion.query(sql, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      console.error('Error al generar reporte semanal:', error);
      return res.render('pages/reportes/semanal', {
        title: 'Reporte Semanal',
        nombre: req.session.nombre,
        medicos: [],
        fechaInicio,
        fechaFin,
        totalCitasSemana: 0,
        layout: 'layouts/main'
      });
    }

    const totalCitasSemana = results.reduce((sum, m) => sum + m.total_citas, 0);

    res.render('pages/reportes/semanal', {
      title: 'Reporte Semanal',
      nombre: req.session.nombre,
      medicos: results,
      fechaInicio,
      fechaFin,
      totalCitasSemana,
      layout: 'layouts/main'
    });
  });
};

