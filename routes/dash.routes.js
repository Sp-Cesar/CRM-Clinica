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

module.exports = routesDash;