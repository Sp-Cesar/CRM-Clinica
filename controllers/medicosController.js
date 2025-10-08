const conexion = require('../models/db');

// Listar médicos
exports.listarMedicos = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const busqueda = req.query.q ? req.query.q.trim() : '';
  let sql = `
    SELECT 
      id,
      nombre,
      apellido,
      especialidad,
      telefono,
      email,
      estado
    FROM medicos
  `;
  const params = [];

  if (busqueda) {
    sql += `
      WHERE nombre LIKE ? 
      OR apellido LIKE ? 
      OR especialidad LIKE ?
    `;
    params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
  }

  sql += ' ORDER BY id DESC';

  conexion.query(sql, params, (error, results) => {
    if (error) {
      console.error('Error al listar médicos:', error);
      return res.render('pages/medicos/index', {
        title: 'Médicos',
        nombre: req.session.nombre,
        medicos: [],
        busqueda,
        error: 'Error al cargar los médicos',
        layout: 'layouts/main'
      });
    }

    res.render('pages/medicos/index', {
      title: 'Médicos',
      nombre: req.session.nombre,
      medicos: results,
      busqueda,
      layout: 'layouts/main'
    });
  });
};

// Crear nuevo médico
exports.crearMedico = (req, res) => {
  const { nombre, apellido, especialidad, telefono, email, estado } = req.body;

  // Validación mínima de campos obligatorios
  if (!nombre || !apellido) {
    console.log('❌ Faltan campos obligatorios');
    return res.redirect('/medicos');
  }

  const nuevoMedico = {
    nombre,
    apellido,
    especialidad: especialidad || null,
    telefono: telefono || null,
    email: email || null,
    estado: estado || 1,
  };

  conexion.query('INSERT INTO medicos SET ?', nuevoMedico, (error) => {
    if (error) {
      console.error('Error al registrar médico:', error);
      return res.redirect('/medicos');
    }

    console.log(`Médico "${nombre} ${apellido}" registrado correctamente.`);
    res.redirect('/medicos');
  });
};
