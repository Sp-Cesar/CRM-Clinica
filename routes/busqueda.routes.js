const express = require('express');
const router = express.Router();
const busquedaController = require('../controllers/busquedaController');

function checkAuth(req, res, next) {
  if (req.session.loggedin) next();
  else res.redirect('/login');
}

// API: Búsqueda global
router.get('/api/busqueda', checkAuth, busquedaController.busquedaGlobal);

// API: Autocompletado
router.get('/api/autocompletado', checkAuth, busquedaController.autocompletado);

// Página de resultados de búsqueda
router.get('/buscar', checkAuth, busquedaController.mostrarResultados);

module.exports = router;
