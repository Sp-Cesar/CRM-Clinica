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

module.exports = router;
