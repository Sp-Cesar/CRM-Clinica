const express = require('express');
const routesAuth = express.Router();
const conexion = require('../models/db');
const authController = require('../controllers/authController');

function redirectIfLoggedIn(req,res,next){
    if(req.session.loggedin){
        res.redirect('/dashboard');
    }else{
        next();
    }
}

routesAuth.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('pages/auth/login',{
        title: "Login",
        message: '',
        layout: 'layouts/auth'
    });
});

routesAuth.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/login')
    })
})

// Procesar login
routesAuth.post('/auth', authController.auth);

module.exports = routesAuth;