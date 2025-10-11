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
    req.session.error = 'DNI, nombre y apellido son campos obligatorios';
    return res.redirect('/pacientes');
  }

  // Validar DNI (solo números, longitud 8-15)
  if (!/^\d{8,15}$/.test(dni.trim())) {
    req.session.error = 'El DNI debe contener solo números (8-15 dígitos)';
    return res.redirect('/pacientes');
  }

  // Validar email si se proporciona
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.error = 'El formato del email no es válido';
    return res.redirect('/pacientes');
  }

  // Validar teléfono si se proporciona
  if (telefono && !/^\d{6,15}$/.test(telefono.trim())) {
    req.session.error = 'El teléfono debe contener solo números (6-15 dígitos)';
    return res.redirect('/pacientes');
  }

  const nuevoPaciente = {
    dni: dni.trim(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    telefono: telefono ? telefono.trim() : null,
    email: email ? email.trim() : null,
    fecha_nacimiento: fecha_nacimiento || null,
    direccion: direccion ? direccion.trim() : null
  };

  const sql = 'INSERT INTO pacientes SET ?';
  conexion.query(sql, nuevoPaciente, (error) => {
    if (error) {
      console.error('Error al registrar paciente:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.session.error = 'Ya existe un paciente con ese DNI';
      } else {
        req.session.error = 'Error al registrar el paciente. Verifica los datos.';
      }
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

  // Validar ID
  if (!id || isNaN(id)) {
    req.session.error = 'ID de paciente inválido';
    return res.redirect('/pacientes');
  }

  // Validar campos requeridos
  if (!dni || !nombre || !apellido) {
    req.session.error = 'DNI, nombre y apellido son obligatorios';
    return res.redirect('/pacientes');
  }

  // Validar DNI
  if (!/^\d{8,15}$/.test(dni.trim())) {
    req.session.error = 'El DNI debe contener solo números (8-15 dígitos)';
    return res.redirect('/pacientes');
  }

  // Validar email si se proporciona
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.error = 'El formato del email no es válido';
    return res.redirect('/pacientes');
  }

  // Validar teléfono si se proporciona
  if (telefono && !/^\d{6,15}$/.test(telefono.trim())) {
    req.session.error = 'El teléfono debe contener solo números (6-15 dígitos)';
    return res.redirect('/pacientes');
  }

  const pacienteActualizado = {
    dni: dni.trim(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    telefono: telefono ? telefono.trim() : null,
    email: email ? email.trim() : null,
    fecha_nacimiento: fecha_nacimiento || null,
    direccion: direccion ? direccion.trim() : null
  };

  conexion.query('UPDATE pacientes SET ? WHERE id = ?', [pacienteActualizado, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar paciente:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        req.session.error = 'Ya existe un paciente con ese DNI';
      } else {
        req.session.error = 'Error al actualizar el paciente. Verifica los datos.';
      }
      return res.redirect('/pacientes');
    }

    if (result.affectedRows === 0) {
      req.session.error = 'Paciente no encontrado';
      return res.redirect('/pacientes');
    }

    req.session.success = 'Paciente actualizado correctamente';
    res.redirect('/pacientes');
  });
};

// Eliminar paciente
exports.eliminarPaciente = (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(id)) {
    req.session.error = 'ID de paciente inválido';
    return res.redirect('/pacientes');
  }

  // Verificar si el paciente tiene citas asociadas
  conexion.query('SELECT COUNT(*) as total FROM citas WHERE paciente_id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error al verificar citas del paciente:', error);
      req.session.error = 'Error al verificar las citas del paciente';
      return res.redirect('/pacientes');
    }

    if (results[0].total > 0) {
      req.session.error = `No se puede eliminar el paciente porque tiene ${results[0].total} cita(s) asociada(s)`;
      return res.redirect('/pacientes');
    }

    // Eliminar paciente si no tiene citas
    conexion.query('DELETE FROM pacientes WHERE id = ?', [id], (error, result) => {
      if (error) {
        console.error('Error al eliminar paciente:', error);
        req.session.error = 'Error al eliminar el paciente';
        return res.redirect('/pacientes');
      }

      if (result.affectedRows === 0) {
        req.session.error = 'Paciente no encontrado';
        return res.redirect('/pacientes');
      }

      req.session.success = 'Paciente eliminado correctamente';
      res.redirect('/pacientes');
    });
  });
};
