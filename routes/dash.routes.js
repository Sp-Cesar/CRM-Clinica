const express = require('express');
const routesDash = express.Router();
const dashboardController = require('../controllers/dashboardController');

function checkAuth(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
}

routesDash.get('/dashboard', checkAuth, dashboardController.verDashboard);

// API endpoints para gráficos
routesDash.get('/api/dashboard/citas-por-mes', checkAuth, dashboardController.getCitasPorMes);
routesDash.get('/api/dashboard/especialidades-demandadas', checkAuth, dashboardController.getEspecialidadesDemandadas);
routesDash.get('/api/dashboard/horarios-ocupados', checkAuth, dashboardController.getHorariosOcupados);
routesDash.get('/api/dashboard/tasa-asistencia-medicos', checkAuth, dashboardController.getTasaAsistenciaMedicos);

module.exports = routesDash;