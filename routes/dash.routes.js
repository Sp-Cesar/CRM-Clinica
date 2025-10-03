const express = require('express');
const routesDash = express.Router();
const conexion = require('../models/db');
const authController = require('../controllers/authController');

function checkAuth(req,res,next){
    if(req.session.loggedin){
        next();
    }else{
        res.redirect('/login');
    }
}

routesDash.get('/dashboard',checkAuth, (req, res) => {
    res.render('pages/dashboard/main', { 
        nombre: req.session.nombre,
        title: "Dashboard"
    });
});


module.exports = routesDash;