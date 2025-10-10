const express = require('express');
const routerPaciente = express.Router();
const pacientesController = require('../controllers/pacientesController');

// Middleware de sesión
function checkAuth(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Listar pacientes
routerPaciente.get('/pacientes', checkAuth, pacientesController.listarPacientes);

// Crear paciente
routerPaciente.post('/pacientes', checkAuth, pacientesController.crearPaciente);

// Editar paciente
routerPaciente.post('/pacientes/editar/:id', checkAuth, pacientesController.editarPaciente);

// Eliminar paciente
routerPaciente.get('/pacientes/eliminar/:id', checkAuth, pacientesController.eliminarPaciente);

module.exports = routerPaciente;
