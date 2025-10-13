const conexion = require('../models/db');

exports.verDashboard = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Consulta para obtener estadísticas generales
  const sqlEstadisticas = `
    SELECT 
      (SELECT COUNT(*) FROM pacientes) as total_pacientes,
      (SELECT COUNT(*) FROM medicos WHERE estado = 1) as total_medicos,
      (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) as citas_hoy,
      (SELECT COUNT(*) FROM citas WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) as citas_mes,
      (SELECT COUNT(*) FROM citas WHERE estado = 'programada' AND fecha >= CURDATE()) as citas_pendientes
  `;

  // Consulta para últimos pacientes
  const sqlUltimosPacientes = `
    SELECT 
      p.nombre,
      p.apellido,
      p.dni,
      DATE_FORMAT(p.creado_en, '%d/%m/%Y') as fecha_registro
    FROM pacientes p
    ORDER BY p.creado_en DESC
    LIMIT 5
  `;

  // Consulta para próximas citas
  const sqlProximasCitas = `
    SELECT 
      c.fecha,
      c.hora,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    WHERE c.fecha >= CURDATE()
    ORDER BY c.fecha ASC, c.hora ASC
    LIMIT 5
  `;

  // Ejecutar consultas
  conexion.query(sqlEstadisticas, (err1, estadisticas) => {
    if (err1) {
      console.error('Error al obtener estadísticas:', err1);
      estadisticas = [{
        total_pacientes: 0,
        total_medicos: 0,
        citas_hoy: 0,
        citas_mes: 0,
        citas_pendientes: 0
      }];
    }

    conexion.query(sqlUltimosPacientes, (err2, ultimosPacientes) => {
      if (err2) {
        console.error('Error al obtener últimos pacientes:', err2);
        ultimosPacientes = [];
      }

      conexion.query(sqlProximasCitas, (err3, proximasCitas) => {
        if (err3) {
          console.error('Error al obtener próximas citas:', err3);
          proximasCitas = [];
        }

        res.render('pages/dashboard/main', {
          title: 'Dashboard',
          nombre: req.session.nombre,
          estadisticas: estadisticas[0],
          ultimosPacientes,
          proximasCitas,
          layout: 'layouts/main'
        });
      });
    });
  });
};

// API: Datos para gráfico de citas por mes (últimos 6 meses)
exports.getCitasPorMes = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT 
      DATE_FORMAT(fecha, '%Y-%m') as mes,
      COUNT(*) as total_citas,
      SUM(CASE WHEN estado = 'atendida' THEN 1 ELSE 0 END) as atendidas,
      SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
      SUM(CASE WHEN estado = 'no_show' THEN 1 ELSE 0 END) as no_show
    FROM citas 
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    ORDER BY mes ASC
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener citas por mes:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Formatear datos para Chart.js
    const datos = {
      labels: results.map(r => {
        const [year, month] = r.mes.split('-');
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${meses[parseInt(month) - 1]} ${year}`;
      }),
      datasets: [
        {
          label: 'Total Citas',
          data: results.map(r => r.total_citas),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        },
        {
          label: 'Atendidas',
          data: results.map(r => r.atendidas),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2
        },
        {
          label: 'Canceladas',
          data: results.map(r => r.canceladas),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }
      ]
    };

    res.json(datos);
  });
};

// API: Datos para gráfico de especialidades más demandadas
exports.getEspecialidadesDemandadas = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT 
      m.especialidad,
      COUNT(c.id) as total_citas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) as atendidas
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    WHERE m.estado = 1
    GROUP BY m.especialidad
    HAVING total_citas > 0
    ORDER BY total_citas DESC
    LIMIT 8
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener especialidades:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const datos = {
      labels: results.map(r => r.especialidad || 'Sin especialidad'),
      datasets: [
        {
          label: 'Total Citas',
          data: results.map(r => r.total_citas),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)'
          ],
          borderWidth: 2
        }
      ]
    };

    res.json(datos);
  });
};

// API: Datos para gráfico de horarios más ocupados
exports.getHorariosOcupados = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT 
      c.hora,
      COUNT(*) as total_citas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) as atendidas
    FROM citas c
    WHERE c.fecha >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY c.hora
    ORDER BY c.hora ASC
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener horarios ocupados:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Formatear horas para mostrar
    const formatearHora = (hora) => {
      const bloques = {
        '08:00:00': '08:00-09:00',
        '09:00:00': '09:00-10:00',
        '10:00:00': '10:00-11:00',
        '11:00:00': '11:00-12:00',
        '13:00:00': '13:00-14:00',
        '14:00:00': '14:00-15:00',
        '15:00:00': '15:00-16:00',
        '16:00:00': '16:00-17:00'
      };
      return bloques[hora] || hora;
    };

    const datos = {
      labels: results.map(r => formatearHora(r.hora)),
      datasets: [
        {
          label: 'Total Citas',
          data: results.map(r => r.total_citas),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2
        },
        {
          label: 'Atendidas',
          data: results.map(r => r.atendidas),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }
      ]
    };

    res.json(datos);
  });
};

// API: Datos para gráfico de tasa de asistencia por médico
exports.getTasaAsistenciaMedicos = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT 
      CONCAT(m.nombre, ' ', m.apellido) as medico_nombre,
      m.especialidad,
      COUNT(c.id) as total_citas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) as atendidas,
      SUM(CASE WHEN c.estado = 'no_show' THEN 1 ELSE 0 END) as no_show,
      ROUND(
        (SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id)), 
        1
      ) as tasa_asistencia
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
    WHERE m.estado = 1
    GROUP BY m.id, m.nombre, m.apellido, m.especialidad
    HAVING total_citas >= 5
    ORDER BY tasa_asistencia DESC
    LIMIT 10
  `;

  conexion.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener tasa de asistencia:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const datos = {
      labels: results.map(r => r.medico_nombre),
      datasets: [
        {
          label: 'Tasa de Asistencia (%)',
          data: results.map(r => r.tasa_asistencia || 0),
          backgroundColor: results.map(r => {
            const tasa = r.tasa_asistencia || 0;
            if (tasa >= 90) return 'rgba(75, 192, 192, 0.8)';
            if (tasa >= 80) return 'rgba(255, 205, 86, 0.8)';
            return 'rgba(255, 99, 132, 0.8)';
          }),
          borderColor: results.map(r => {
            const tasa = r.tasa_asistencia || 0;
            if (tasa >= 90) return 'rgba(75, 192, 192, 1)';
            if (tasa >= 80) return 'rgba(255, 205, 86, 1)';
            return 'rgba(255, 99, 132, 1)';
          }),
          borderWidth: 2
        }
      ]
    };

    res.json(datos);
  });
};

