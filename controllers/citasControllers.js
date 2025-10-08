const conexion = require('../models/db');

// 📋 LISTAR CITAS
exports.listarCitas = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fechaFiltro = req.query.fecha || '';
  const medicoFiltro = req.query.medico_id || '';
  const estadoFiltro = req.query.estado || '';

  let sql = `
    SELECT 
      c.id,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      s.nombre AS sede_nombre,
      c.fecha,
      c.hora,
      c.motivo,
      c.estado
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    INNER JOIN sedes s ON c.sede_id = s.id
    WHERE 1=1
  `;

  const params = [];

  if (fechaFiltro) {
    sql += ' AND c.fecha = ?';
    params.push(fechaFiltro);
  }

  if (medicoFiltro) {
    sql += ' AND c.medico_id = ?';
    params.push(medicoFiltro);
  }

  if (estadoFiltro) {
    sql += ' AND c.estado = ?';
    params.push(estadoFiltro);
  }

  sql += ' ORDER BY c.fecha DESC, c.hora ASC';

  conexion.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al listar citas:', error);
      return res.render('pages/citas/index', {
        title: 'Citas Médicas',
        nombre: req.session.nombre,
        citas: [],
        medicos: [],
        pacientes: [],
        fechaFiltro,
        medicoFiltro,
        estadoFiltro,
        layout: 'layouts/main'
      });
    }

    // Convertir la hora SQL a formato legible (ej. "08:00:00" → "08:00 - 09:00 AM")
    const citasFormateadas = results.map(c => {
    const fechaISO = c.fecha instanceof Date
        ? c.fecha.toISOString().split('T')[0]
        : c.fecha;

    return {
        ...c,
        fecha_formateada: fechaISO ? formatearFechaPeru(fechaISO) : 'Sin fecha',
        hora_formateada: c.hora ? formatearHoraBloque(c.hora) : 'Sin hora'
    };
    });




    function formatearFechaPeru(fechaSQL) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    // Convertir fecha SQL (YYYY-MM-DD) a objeto Date
    const fechaObj = new Date(fechaSQL + 'T00:00:00-05:00'); // Zona horaria Perú

    const diaSemana = dias[fechaObj.getDay()];
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = meses[fechaObj.getMonth()];
    const anio = fechaObj.getFullYear();

    return `${diaSemana} ${dia}/${mes}/${anio}`;
    }

    // Obtener médicos y pacientes para los selects del modal
    conexion.query('SELECT * FROM medicos ORDER BY nombre ASC', (errM, medicos) => {
      if (errM) medicos = [];
      conexion.query('SELECT * FROM pacientes ORDER BY nombre ASC', (errP, pacientes) => {
        if (errP) pacientes = [];

        res.render('pages/citas/index', {
          title: 'Citas Médicas',
          nombre: req.session.nombre,
          citas: citasFormateadas,
          medicos,
          pacientes,
          fechaFiltro,
          medicoFiltro,
          estadoFiltro,
          layout: 'layouts/main'
        });
      });
    });
  });
};

// CREAR CITA
exports.crearCita = (req, res) => {
  const { paciente_id, medico_id, fecha, hora, motivo } = req.body;
  const sede_id = req.session.sede_id;
  const creado_por = req.session.userId || null; // Asumiendo que guardaste userId en login

  // Validación mínima
  if (!paciente_id || !medico_id || !fecha || !hora) {
    console.log('Faltan campos obligatorios.');
    return res.redirect('/citas');
  }

  // Validar duplicados
  const sqlCheck = `
    SELECT * FROM citas 
    WHERE medico_id = ? AND sede_id = ? AND fecha = ? AND hora = ?
  `;

  conexion.query(sqlCheck, [medico_id, sede_id, fecha, hora], (err, results) => {
    if (err) {
      console.error('Error validando duplicado:', err);
      return res.redirect('/citas');
    }

    if (results.length > 0) {
      console.log('Cita duplicada detectada');
      return res.redirect('/citas'); // Más adelante podríamos mostrar un toast visual
    }

    const sede_id = 1;  

    // Insertar nueva cita
    const nuevaCita = {
      paciente_id,
      medico_id,
      sede_id,
      fecha,
      hora,
      motivo: motivo || null,
      estado: 'programada',
      creado_por
    };

    conexion.query('INSERT INTO citas SET ?', nuevaCita, (error) => {
      if (error) {
    console.error('Error al crear cita:', error);

    if (error.code === 'ER_DUP_ENTRY') {
        req.session.error = 'El médico ya tiene una cita programada en ese horario.';
    } else {
        req.session.error = 'Ocurrió un error al registrar la cita.';
    }

    return res.redirect('/citas');
    }

    req.session.success = 'Cita registrada correctamente.';
    res.redirect('/citas');

    });
  });
};

// 🕒 Helper para mostrar rangos horarios
function formatearHoraBloque(horaSQL) {
  const bloques = {
    '08:00:00': '08:00 - 09:00 AM',
    '09:00:00': '09:00 - 10:00 AM',
    '10:00:00': '10:00 - 11:00 AM',
    '11:00:00': '11:00 - 12:00 PM',
    '13:00:00': '01:00 - 02:00 PM',
    '14:00:00': '02:00 - 03:00 PM',
    '15:00:00': '03:00 - 04:00 PM',
    '16:00:00': '04:00 - 05:00 PM'
  };
  return bloques[horaSQL] || horaSQL;
}
