const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

function checkAuth(req, res, next) {
  if (req.session.loggedin) next();
  else res.redirect('/login');
}

// Ver página principal de reportes
router.get('/reportes', checkAuth, reportesController.verReportes);

// Reporte diario
router.get('/reportes/diario', checkAuth, reportesController.reporteDiario);

// Reporte semanal
router.get('/reportes/semanal', checkAuth, reportesController.reporteSemanal);

module.exports = router;

