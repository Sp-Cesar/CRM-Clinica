const conexion = require('../models/db');

// Listar historial de atenciones
exports.listarHistorial = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const pacienteFiltro = req.query.paciente_id || '';
  const medicoFiltro = req.query.medico_id || '';

  let sql = `
    SELECT 
      h.id,
      h.paciente_id,
      h.medico_id,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      h.fecha_atencion,
      h.diagnostico,
      h.observaciones,
      h.tratamiento,
      h.creado_en
    FROM historial_atenciones h
    INNER JOIN pacientes p ON h.paciente_id = p.id
    INNER JOIN medicos m ON h.medico_id = m.id
    WHERE 1=1
  `;

  const params = [];

  if (pacienteFiltro) {
    sql += ' AND h.paciente_id = ?';
    params.push(pacienteFiltro);
  }

  if (medicoFiltro) {
    sql += ' AND h.medico_id = ?';
    params.push(medicoFiltro);
  }

  sql += ' ORDER BY h.fecha_atencion DESC, h.creado_en DESC';

  conexion.query(sql, params, (error, historiales) => {
    if (error) {
      console.error('Error al listar historial:', error);
      return res.render('pages/historial/index', {
        title: 'Historial de Atenciones',
        nombre: req.session.nombre,
        historiales: [],
        pacientes: [],
        medicos: [],
        pacienteFiltro,
        medicoFiltro,
        layout: 'layouts/main'
      });
    }

    // Obtener pacientes y médicos para los filtros
    conexion.query('SELECT * FROM pacientes ORDER BY nombre ASC', (errP, pacientes) => {
      if (errP) pacientes = [];
      conexion.query('SELECT * FROM medicos ORDER BY nombre ASC', (errM, medicos) => {
        if (errM) medicos = [];

        res.render('pages/historial/index', {
          title: 'Historial de Atenciones',
          nombre: req.session.nombre,
          historiales,
          pacientes,
          medicos,
          pacienteFiltro,
          medicoFiltro,
          layout: 'layouts/main'
        });
      });
    });
  });
};

// Crear registro en historial
exports.crearHistorial = (req, res) => {
  const { paciente_id, medico_id, fecha_atencion, diagnostico, observaciones, tratamiento } = req.body;

  if (!paciente_id || !medico_id || !fecha_atencion || !diagnostico) {
    req.session.error = 'Paciente, médico, fecha y diagnóstico son obligatorios';
    return res.redirect('/historial');
  }

  const nuevoHistorial = {
    paciente_id: parseInt(paciente_id),
    medico_id: parseInt(medico_id),
    fecha_atencion,
    diagnostico,
    observaciones: observaciones || null,
    tratamiento: tratamiento || null,
    creado_por: req.session.userId || null
  };

  console.log('Datos a insertar:', nuevoHistorial);

  conexion.query('INSERT INTO historial_atenciones SET ?', nuevoHistorial, (error) => {
    if (error) {
      console.error('Error al registrar historial:', error);
      console.error('Error detallado:', error.message);
      req.session.error = `Error al registrar la atención: ${error.message}`;
      return res.redirect('/historial');
    }

    req.session.success = 'Atención registrada correctamente';
    res.redirect('/historial');
  });
};

// Ver historial por paciente
exports.verHistorialPaciente = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');
  
  const { id } = req.params;

  const sql = `
    SELECT 
      h.id,
      h.fecha_atencion,
      h.diagnostico,
      h.observaciones,
      h.tratamiento,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni
    FROM historial_atenciones h
    INNER JOIN medicos m ON h.medico_id = m.id
    INNER JOIN pacientes p ON h.paciente_id = p.id
    WHERE h.paciente_id = ?
    ORDER BY h.fecha_atencion DESC
  `;

  conexion.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error al consultar historial:', error);
      req.session.error = 'Error al consultar el historial';
      return res.redirect('/historial');
    }

    res.render('pages/historial/detalle', {
      title: 'Historial del Paciente',
      nombre: req.session.nombre,
      historiales: results,
      paciente: results.length > 0 ? {
        nombre: results[0].paciente_nombre,
        apellido: results[0].paciente_apellido,
        dni: results[0].paciente_dni
      } : null,
      layout: 'layouts/main'
    });
  });
};

// Eliminar registro de historial
exports.eliminarHistorial = (req, res) => {
  const { id } = req.params;

  conexion.query('DELETE FROM historial_atenciones WHERE id = ?', [id], (error) => {
    if (error) {
      console.error('Error al eliminar historial:', error);
      req.session.error = 'Error al eliminar el registro';
    } else {
      req.session.success = 'Registro eliminado correctamente';
    }
    res.redirect('/historial');
  });
};

