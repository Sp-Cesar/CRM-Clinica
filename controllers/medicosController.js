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

  // Validar campos obligatorios
  if (!nombre || !apellido) {
    req.session.error = 'Nombre y apellido son obligatorios';
    return res.redirect('/medicos');
  }

  // Validar email si se proporciona
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.error = 'El formato del email no es válido';
    return res.redirect('/medicos');
  }

  // Validar teléfono si se proporciona
  if (telefono && !/^\d{6,15}$/.test(telefono.trim())) {
    req.session.error = 'El teléfono debe contener solo números (6-15 dígitos)';
    return res.redirect('/medicos');
  }

  const nuevoMedico = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    especialidad: especialidad ? especialidad.trim() : null,
    telefono: telefono ? telefono.trim() : null,
    email: email ? email.trim() : null,
    estado: estado || 1,
  };

  conexion.query('INSERT INTO medicos SET ?', nuevoMedico, (error) => {
    if (error) {
      console.error('Error al registrar médico:', error);
      req.session.error = 'Error al registrar el médico. Verifica los datos.';
      return res.redirect('/medicos');
    }

    req.session.success = `Médico ${nombre} ${apellido} registrado correctamente`;
    res.redirect('/medicos');
  });
};

// Editar médico
exports.editarMedico = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, especialidad, telefono, email, estado } = req.body;

  // Validar ID
  if (!id || isNaN(id)) {
    req.session.error = 'ID de médico inválido';
    return res.redirect('/medicos');
  }

  // Validar campos obligatorios
  if (!nombre || !apellido) {
    req.session.error = 'Nombre y apellido son obligatorios';
    return res.redirect('/medicos');
  }

  // Validar email si se proporciona
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    req.session.error = 'El formato del email no es válido';
    return res.redirect('/medicos');
  }

  // Validar teléfono si se proporciona
  if (telefono && !/^\d{6,15}$/.test(telefono.trim())) {
    req.session.error = 'El teléfono debe contener solo números (6-15 dígitos)';
    return res.redirect('/medicos');
  }

  const medicoActualizado = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    especialidad: especialidad ? especialidad.trim() : null,
    telefono: telefono ? telefono.trim() : null,
    email: email ? email.trim() : null,
    estado: estado !== undefined ? estado : 1,
  };

  conexion.query('UPDATE medicos SET ? WHERE id = ?', [medicoActualizado, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar médico:', error);
      req.session.error = 'Error al actualizar el médico. Verifica los datos.';
      return res.redirect('/medicos');
    }

    if (result.affectedRows === 0) {
      req.session.error = 'Médico no encontrado';
      return res.redirect('/medicos');
    }

    req.session.success = 'Médico actualizado correctamente';
    res.redirect('/medicos');
  });
};

// Eliminar médico
exports.eliminarMedico = (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(id)) {
    req.session.error = 'ID de médico inválido';
    return res.redirect('/medicos');
  }

  // Verificar si tiene citas asociadas
  conexion.query('SELECT COUNT(*) as total FROM citas WHERE medico_id = ?', [id], (errCheck, results) => {
    if (errCheck) {
      console.error('Error al verificar citas:', errCheck);
      req.session.error = 'Error al verificar las citas del médico';
      return res.redirect('/medicos');
    }

    const totalCitas = results[0].total;

    if (totalCitas > 0) {
      req.session.error = `No se puede eliminar el médico porque tiene ${totalCitas} cita(s) asociada(s)`;
      return res.redirect('/medicos');
    }

    // Si no tiene citas, proceder con la eliminación
    conexion.query('DELETE FROM medicos WHERE id = ?', [id], (error, result) => {
      if (error) {
        console.error('Error al eliminar médico:', error);
        req.session.error = 'Error al eliminar el médico';
        return res.redirect('/medicos');
      }

      if (result.affectedRows === 0) {
        req.session.error = 'Médico no encontrado';
        return res.redirect('/medicos');
      }

      req.session.success = 'Médico eliminado correctamente';
      res.redirect('/medicos');
    });
  });
};
