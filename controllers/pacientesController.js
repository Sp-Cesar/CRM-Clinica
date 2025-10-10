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
      req.session.error = 'Error al registrar el paciente';
      return res.redirect('/pacientes');
    }

    req.session.success = `Paciente ${nombre} ${apellido} registrado correctamente`;
    res.redirect('/pacientes');
  });
};


// Editar paciente
exports.editarPaciente = (req, res) => {
  const { id } = req.params;
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
    req.session.error = 'DNI, nombre y apellido son obligatorios';
    return res.redirect('/pacientes');
  }

  const pacienteActualizado = {
    dni,
    nombre,
    apellido,
    telefono,
    email,
    fecha_nacimiento,
    direccion
  };

  conexion.query('UPDATE pacientes SET ? WHERE id = ?', [pacienteActualizado, id], (error) => {
    if (error) {
      console.error('Error al actualizar paciente:', error);
      req.session.error = 'Error al actualizar el paciente';
      return res.redirect('/pacientes');
    }

    req.session.success = 'Paciente actualizado correctamente';
    res.redirect('/pacientes');
  });
};

// Eliminar paciente
exports.eliminarPaciente = (req, res) => {
  const { id } = req.params;

  conexion.query('DELETE FROM pacientes WHERE id = ?', [id], (error) => {
    if (error) {
      console.log(' Error al eliminar paciente:', error);
      req.session.error = 'Error al eliminar el paciente';
    } else {
      req.session.success = 'Paciente eliminado correctamente';
    }
    res.redirect('/pacientes');
  });
};
