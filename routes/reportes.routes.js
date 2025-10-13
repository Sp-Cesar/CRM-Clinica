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

// Exportar reporte diario a Excel
router.get('/reportes/diario/excel', checkAuth, reportesController.exportarDiarioExcel);

// Exportar reporte diario a PDF
router.get('/reportes/diario/pdf', checkAuth, reportesController.exportarDiarioPDF);

// Exportar reporte semanal a Excel
router.get('/reportes/semanal/excel', checkAuth, reportesController.exportarSemanalExcel);

// Exportar reporte semanal a PDF
router.get('/reportes/semanal/pdf', checkAuth, reportesController.exportarSemanalPDF);

module.exports = router;

