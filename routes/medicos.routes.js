const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');

function checkAuth(req, res, next) {
  if (req.session.loggedin) next();
  else res.redirect('/login');
}

router.get('/medicos', checkAuth, medicosController.listarMedicos);
router.post('/medicos', checkAuth, medicosController.crearMedico);
router.post('/medicos/editar/:id', checkAuth, medicosController.editarMedico);
router.post('/medicos/eliminar/:id', checkAuth, medicosController.eliminarMedico);

module.exports = router;
