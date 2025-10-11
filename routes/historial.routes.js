const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

function checkAuth(req, res, next) {
  if (req.session.loggedin) next();
  else res.redirect('/login');
}

// Listar historial
router.get('/historial', checkAuth, historialController.listarHistorial);

// Crear historial
router.post('/historial', checkAuth, historialController.crearHistorial);

// Ver historial por paciente
router.get('/historial/paciente/:id', checkAuth, historialController.verHistorialPaciente);

// Eliminar historial
router.get('/historial/eliminar/:id', checkAuth, historialController.eliminarHistorial);

module.exports = router;

