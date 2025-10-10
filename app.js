const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// Configuración de sesión
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

app.use(express.static(__dirname + '/public'));

// Middleware para parsear formularios
app.use(express.urlencoded({ extended: true }));

// Middleware para mensajes temporales (flash)
app.use((req, res, next) => {
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});


// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(expressLayouts)
app.set('layout', 'layouts/main');

app.use('/', require('./routes/auth.routes'));
app.use('/', require('./routes/dash.routes'));
app.use('/', require('./routes/paciente.routes'));
app.use('/', require('./routes/medicos.routes'));
app.use('/', require('./routes/citas.routes'));
app.use('/', require('./routes/historial.routes'));
app.use('/', require('./routes/reportes.routes'));


app.listen(3000, () => {
    console.log('Server is running http://localhost:3000/login');
});