const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasControllers');

function checkAuth(req, res, next) {
  if (req.session.loggedin) next();
  else res.redirect('/login');
}

// Listar citas
router.get('/citas', checkAuth, citasController.listarCitas);

// Crear cita
router.post('/citas', checkAuth, citasController.crearCita);

// Editar cita
router.post('/citas/editar/:id', checkAuth, citasController.editarCita);

// Cancelar cita
router.get('/citas/cancelar/:id', checkAuth, citasController.cancelarCita);

// Eliminar cita
router.get('/citas/eliminar/:id', checkAuth, citasController.eliminarCita);

module.exports = router;
