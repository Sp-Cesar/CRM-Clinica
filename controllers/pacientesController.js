const conexion = require('../models/db');

// Mostrar lista de pacientes
exports.listarPacientes = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const busqueda = req.query.q ? req.query.q.trim() : '';

  let sql = `
    SELECT 
      id,
      dni,
      nombre,
      apellido,
      telefono,
      email,
      fecha_nacimiento,
      TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) AS edad,
      direccion
    FROM pacientes
  `;

  const params = [];

  // Si hay texto de búsqueda, agregamos condición WHERE
  if (busqueda) {
    sql += `
      WHERE nombre LIKE ? 
      OR apellido LIKE ? 
      OR dni LIKE ?
    `;
    params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
  }

  sql += ' ORDER BY id DESC';

  conexion.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al listar pacientes:', error);
      return res.render('pages/pacientes/index', {
        title: 'Pacientes',
        nombre: req.session.nombre,
        pacientes: [],
        busqueda,
        error: 'Error al cargar los pacientes',
        layout: 'layouts/main'
      });
    }

    res.render('pages/pacientes/index', {
      title: 'Pacientes',
      nombre: req.session.nombre,
      pacientes: results,
      busqueda,
      layout: 'layouts/main'
    });
  });
};


// Crear nuevo paciente
exports.crearPaciente = (req, res) => {
  const {
    dni,
    nombre,
    apellido,
    telefono,
    email,
    fecha_nacimiento,
    direccion
  } = req.body;

  // Validar campos requeridos
  if (!dni || !nombre || !apellido) {
    console.log('Campos obligatorios faltantes');
    return res.redirect('/pacientes');
  }

  const nuevoPaciente = {
    dni,
    nombre,
    apellido,
    telefono,
    email,
    fecha_nacimiento,
    direccion
  };

  // Solo columnas existentes
  const sql = 'INSERT INTO pacientes SET ?';
  conexion.query(sql, nuevoPaciente, (error) => {
    if (error) {
      console.error('Error al registrar paciente:', error);
      return res.redirect('/pacientes');
    }

    console.log(` Paciente ${nombre} ${apellido} registrado correctamente`);
    res.redirect('/pacientes');
  });
};


// Eliminar paciente
exports.eliminarPaciente = (req, res) => {
  const { id } = req.params;

  conexion.query('DELETE FROM pacientes WHERE id = ?', [id], (error) => {
    if (error) {
      console.log(' Error al eliminar paciente:', error);
    }
    res.redirect('/pacientes');
  });
};
