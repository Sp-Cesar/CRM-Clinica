const conexion = require('../models/db');
const bcrypt = require('bcryptjs');

exports.auth = async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    if(email && password){
        conexion.query('SELECT * FROM usuarios WHERE email = ?', [email],async(error,results)=>{
            // Si no se encuentra el usuario
            if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))){
                res.render('pages/auth/login', { 
                    title: "Login",
                    message: 'El email o la contraseña son incorrectos',
                    layout: 'layouts/auth'});
            }else{
                req.session.loggedin = true;
                req.session.userId = results[0].id;
                req.session.nombre = results[0].nombre;
                req.session.rol = results[0].rol;
                res.redirect('/dashboard');
            }
        })
    }else{
        res.render('pages/auth/login', { 
            message: 'Por favor ingrese un email y contraseña',
            title: "Login",
            layout: 'layouts/auth'
        });
    }
};