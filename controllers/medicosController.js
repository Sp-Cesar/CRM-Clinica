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
    req.session.error = 'Nombre y apellido son obligatorios';
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
      req.session.error = 'Error al registrar el médico';
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

  if (!nombre || !apellido) {
    req.session.error = 'Nombre y apellido son obligatorios';
    return res.redirect('/medicos');
  }

  const medicoActualizado = {
    nombre,
    apellido,
    especialidad: especialidad || null,
    telefono: telefono || null,
    email: email || null,
    estado: estado !== undefined ? estado : 1,
  };

  conexion.query('UPDATE medicos SET ? WHERE id = ?', [medicoActualizado, id], (error) => {
    if (error) {
      console.error('Error al actualizar médico:', error);
      req.session.error = 'Error al actualizar el médico';
      return res.redirect('/medicos');
    }

    req.session.success = 'Médico actualizado correctamente';
    res.redirect('/medicos');
  });
};

// Eliminar médico
exports.eliminarMedico = (req, res) => {
  const { id } = req.params;

  // Primero verificar si tiene citas asociadas
  conexion.query('SELECT COUNT(*) as total FROM citas WHERE medico_id = ?', [id], (errCheck, results) => {
    if (errCheck) {
      console.error('Error al verificar citas:', errCheck);
      req.session.error = 'Error al verificar el médico';
      return res.redirect('/medicos');
    }

    const totalCitas = results[0].total;

    if (totalCitas > 0) {
      req.session.error = `No se puede eliminar el médico porque tiene ${totalCitas} cita(s) asociada(s). Elimina o reasigna las citas primero.`;
      return res.redirect('/medicos');
    }

    // Si no tiene citas, proceder con la eliminación
    conexion.query('DELETE FROM medicos WHERE id = ?', [id], (error) => {
      if (error) {
        console.error('Error al eliminar médico:', error);
        req.session.error = 'Error al eliminar el médico';
      } else {
        req.session.success = 'Médico eliminado correctamente';
      }
      res.redirect('/medicos');
    });
  });
};
