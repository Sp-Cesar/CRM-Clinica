const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Configurar con tu contraseña de MySQL
    database: 'dbmiclinica'
});
conexion.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});



module.exports = conexion;