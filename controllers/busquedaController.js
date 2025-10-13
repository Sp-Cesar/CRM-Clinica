const conexion = require('../models/db');

// Búsqueda global inteligente
exports.busquedaGlobal = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { q, tipo } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Término de búsqueda muy corto' });
  }

  const termino = q.trim();
  const resultados = {
    pacientes: [],
    medicos: [],
    citas: [],
    historial: []
  };

  // Función para ejecutar búsquedas en paralelo
  const buscarPacientes = () => {
    return new Promise((resolve) => {
      // Dividir el término en palabras para búsqueda más flexible
      const palabras = termino.trim().split(/\s+/);
      let condiciones = [];
      let params = [];
      
      // Para cada palabra, buscar en todos los campos
      palabras.forEach(palabra => {
        const palabraBusqueda = `%${palabra}%`;
        condiciones.push(`(
          nombre LIKE ? OR 
          apellido LIKE ? OR 
          dni LIKE ? OR 
          telefono LIKE ? OR 
          email LIKE ? OR 
          CONCAT(nombre, ' ', apellido) LIKE ?
        )`);
        params.push(palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda);
      });
      
      const sql = `
        SELECT 
          id,
          nombre,
          apellido,
          dni,
          telefono,
          email,
          'paciente' as tipo
        FROM pacientes 
        WHERE ${condiciones.join(' AND ')}
        ORDER BY nombre, apellido
        LIMIT 10
      `;
      
      conexion.query(sql, params, (error, results) => {
        if (error) {
          console.error('Error en búsqueda de pacientes:', error);
          resolve([]);
        } else {
          resolve(results);
        }
      });
    });
  };

  const buscarMedicos = () => {
    return new Promise((resolve) => {
      // Dividir el término en palabras para búsqueda más flexible
      const palabras = termino.trim().split(/\s+/);
      let condiciones = [];
      let params = [];
      
      // Para cada palabra, buscar en todos los campos
      palabras.forEach(palabra => {
        const palabraBusqueda = `%${palabra}%`;
        condiciones.push(`(
          nombre LIKE ? OR 
          apellido LIKE ? OR 
          especialidad LIKE ? OR 
          telefono LIKE ? OR 
          email LIKE ? OR 
          CONCAT(nombre, ' ', apellido) LIKE ?
        )`);
        params.push(palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda);
      });
      
      const sql = `
        SELECT 
          id,
          nombre,
          apellido,
          especialidad,
          telefono,
          email,
          'medico' as tipo
        FROM medicos 
        WHERE estado = 1 AND ${condiciones.join(' AND ')}
        ORDER BY nombre, apellido
        LIMIT 10
      `;
      
      conexion.query(sql, params, (error, results) => {
        if (error) {
          console.error('Error en búsqueda de médicos:', error);
          resolve([]);
        } else {
          resolve(results);
        }
      });
    });
  };

  const buscarCitas = () => {
    return new Promise((resolve) => {
      // Dividir el término en palabras para búsqueda más flexible
      const palabras = termino.trim().split(/\s+/);
      let condiciones = [];
      let params = [];
      
      // Para cada palabra, buscar en todos los campos
      palabras.forEach(palabra => {
        const palabraBusqueda = `%${palabra}%`;
        condiciones.push(`(
          p.nombre LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ? OR 
          CONCAT(p.nombre, ' ', p.apellido) LIKE ? OR
          m.nombre LIKE ? OR m.apellido LIKE ? OR m.especialidad LIKE ? OR
          CONCAT(m.nombre, ' ', m.apellido) LIKE ? OR
          c.motivo LIKE ? OR c.estado LIKE ?
        )`);
        params.push(palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, 
                    palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, 
                    palabraBusqueda, palabraBusqueda);
      });
      
      const sql = `
        SELECT 
          c.id,
          c.fecha,
          c.hora,
          c.motivo,
          c.estado,
          p.nombre as paciente_nombre,
          p.apellido as paciente_apellido,
          m.nombre as medico_nombre,
          m.apellido as medico_apellido,
          m.especialidad,
          'cita' as tipo
        FROM citas c
        INNER JOIN pacientes p ON c.paciente_id = p.id
        INNER JOIN medicos m ON c.medico_id = m.id
        WHERE ${condiciones.join(' AND ')}
        ORDER BY c.fecha DESC, c.hora DESC
        LIMIT 15
      `;
      conexion.query(sql, params, (error, results) => {
        if (error) {
          console.error('Error en búsqueda de citas:', error);
          resolve([]);
        } else {
          resolve(results);
        }
      });
    });
  };

  const buscarHistorial = () => {
    return new Promise((resolve) => {
      // Dividir el término en palabras para búsqueda más flexible
      const palabras = termino.trim().split(/\s+/);
      let condiciones = [];
      let params = [];
      
      // Para cada palabra, buscar en todos los campos
      palabras.forEach(palabra => {
        const palabraBusqueda = `%${palabra}%`;
        condiciones.push(`(
          p.nombre LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ? OR
          CONCAT(p.nombre, ' ', p.apellido) LIKE ? OR
          m.nombre LIKE ? OR m.apellido LIKE ? OR
          CONCAT(m.nombre, ' ', m.apellido) LIKE ? OR
          h.diagnostico LIKE ? OR h.observaciones LIKE ? OR h.tratamiento LIKE ?
        )`);
        params.push(palabraBusqueda, palabraBusqueda, palabraBusqueda, palabraBusqueda, 
                    palabraBusqueda, palabraBusqueda, palabraBusqueda, 
                    palabraBusqueda, palabraBusqueda, palabraBusqueda);
      });
      
      const sql = `
        SELECT 
          h.id,
          h.diagnostico,
          h.observaciones,
          h.tratamiento,
          h.fecha_atencion,
          p.nombre as paciente_nombre,
          p.apellido as paciente_apellido,
          p.dni as paciente_dni,
          m.nombre as medico_nombre,
          m.apellido as medico_apellido,
          'historial' as tipo
        FROM historial_atenciones h
        INNER JOIN pacientes p ON h.paciente_id = p.id
        INNER JOIN medicos m ON h.medico_id = m.id
        WHERE ${condiciones.join(' AND ')}
        ORDER BY h.fecha_atencion DESC
        LIMIT 10
      `;
      
      conexion.query(sql, params, (error, results) => {
        if (error) {
          console.error('Error en búsqueda de historial:', error);
          resolve([]);
        } else {
          resolve(results);
        }
      });
    });
  };

  // Ejecutar búsquedas según el tipo especificado o todas si no se especifica
  const promesas = [];
  
  if (!tipo || tipo === 'pacientes') promesas.push(buscarPacientes().then(r => resultados.pacientes = r));
  if (!tipo || tipo === 'medicos') promesas.push(buscarMedicos().then(r => resultados.medicos = r));
  if (!tipo || tipo === 'citas') promesas.push(buscarCitas().then(r => resultados.citas = r));
  if (!tipo || tipo === 'historial') promesas.push(buscarHistorial().then(r => resultados.historial = r));

  Promise.all(promesas).then(() => {
    // Calcular totales
    const totales = {
      pacientes: resultados.pacientes.length,
      medicos: resultados.medicos.length,
      citas: resultados.citas.length,
      historial: resultados.historial.length,
      total: resultados.pacientes.length + resultados.medicos.length + resultados.citas.length + resultados.historial.length
    };

    res.json({
      termino,
      resultados,
      totales,
      timestamp: new Date().toISOString()
    });
  }).catch(error => {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
};

// Autocompletado para búsqueda
exports.autocompletado = (req, res) => {
  if (!req.session.loggedin) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { q, tipo } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.json({ sugerencias: [] });
  }

  const termino = q.trim();
  const sugerencias = [];

  // Buscar sugerencias de pacientes
  const sqlPacientes = `
    SELECT 
      CONCAT(nombre, ' ', apellido) as texto,
      dni,
      'paciente' as tipo,
      '👤' as icono
    FROM pacientes 
    WHERE (nombre LIKE ? OR apellido LIKE ? OR dni LIKE ? OR CONCAT(nombre, ' ', apellido) LIKE ?)
    ORDER BY nombre, apellido
    LIMIT 5
  `;

  // Buscar sugerencias de médicos
  const sqlMedicos = `
    SELECT 
      CONCAT(nombre, ' ', apellido) as texto,
      especialidad,
      'medico' as tipo,
      '👨‍⚕️' as icono
    FROM medicos 
    WHERE estado = 1 AND (nombre LIKE ? OR apellido LIKE ? OR especialidad LIKE ? OR CONCAT(nombre, ' ', apellido) LIKE ?)
    ORDER BY nombre, apellido
    LIMIT 5
  `;

  // Buscar sugerencias de citas (motivos comunes)
  const sqlCitas = `
    SELECT DISTINCT
      motivo as texto,
      'cita' as tipo,
      '📅' as icono
    FROM citas 
    WHERE motivo LIKE ? AND motivo IS NOT NULL AND motivo != ''
    ORDER BY motivo
    LIMIT 5
  `;

  // Buscar sugerencias de diagnósticos
  const sqlDiagnosticos = `
    SELECT DISTINCT
      diagnostico as texto,
      'diagnostico' as tipo,
      '📋' as icono
    FROM historial_atenciones 
    WHERE diagnostico LIKE ? AND diagnostico IS NOT NULL AND diagnostico != ''
    ORDER BY diagnostico
    LIMIT 5
  `;

  const terminoBusqueda = `%${termino}%`;
  const promesas = [];

  // Ejecutar búsquedas según el tipo especificado
  if (!tipo || tipo === 'pacientes') {
    promesas.push(new Promise((resolve) => {
      conexion.query(sqlPacientes, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
        if (!error) sugerencias.push(...results);
        resolve();
      });
    }));
  }

  if (!tipo || tipo === 'medicos') {
    promesas.push(new Promise((resolve) => {
      conexion.query(sqlMedicos, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
        if (!error) sugerencias.push(...results);
        resolve();
      });
    }));
  }

  if (!tipo || tipo === 'citas') {
    promesas.push(new Promise((resolve) => {
      conexion.query(sqlCitas, [terminoBusqueda], (error, results) => {
        if (!error) sugerencias.push(...results);
        resolve();
      });
    }));
  }

  if (!tipo || tipo === 'historial') {
    promesas.push(new Promise((resolve) => {
      conexion.query(sqlDiagnosticos, [terminoBusqueda], (error, results) => {
        if (!error) sugerencias.push(...results);
        resolve();
      });
    }));
  }

  Promise.all(promesas).then(() => {
    // Ordenar sugerencias por relevancia
    sugerencias.sort((a, b) => {
      const aRelevancia = a.texto.toLowerCase().indexOf(termino.toLowerCase());
      const bRelevancia = b.texto.toLowerCase().indexOf(termino.toLowerCase());
      return aRelevancia - bRelevancia;
    });

    res.json({ sugerencias: sugerencias.slice(0, 8) });
  }).catch(error => {
    console.error('Error en autocompletado:', error);
    res.json({ sugerencias: [] });
  });
};

// Página de resultados de búsqueda
exports.mostrarResultados = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const { q, tipo } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.render('pages/busqueda/resultados', {
      title: 'Búsqueda',
      nombre: req.session.nombre,
      termino: '',
      resultados: { pacientes: [], medicos: [], citas: [], historial: [] },
      totales: { total: 0 },
      layout: 'layouts/main'
    });
  }

  // Reutilizar la lógica de búsqueda global
  const termino = q.trim();
  const resultados = {
    pacientes: [],
    medicos: [],
    citas: [],
    historial: []
  };

  // Función para ejecutar búsquedas (simplificada para la vista)
  const ejecutarBusquedas = () => {
    return new Promise((resolve) => {
      const promesas = [];

      // Búsqueda de pacientes
      if (!tipo || tipo === 'pacientes') {
        promesas.push(new Promise((resolvePacientes) => {
          const sql = `
            SELECT 
              id, nombre, apellido, dni, telefono, email,
              DATE_FORMAT(creado_en, '%d/%m/%Y') as fecha_registro
            FROM pacientes 
            WHERE (nombre LIKE ? OR apellido LIKE ? OR dni LIKE ? OR telefono LIKE ? OR email LIKE ?)
            ORDER BY nombre, apellido
            LIMIT 20
          `;
          
          const terminoBusqueda = `%${termino}%`;
          conexion.query(sql, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
            if (!error) resultados.pacientes = results;
            resolvePacientes();
          });
        }));
      }

      // Búsqueda de médicos
      if (!tipo || tipo === 'medicos') {
        promesas.push(new Promise((resolveMedicos) => {
          const sql = `
            SELECT 
              id, nombre, apellido, especialidad, telefono, email, estado
            FROM medicos 
            WHERE estado = 1 AND (nombre LIKE ? OR apellido LIKE ? OR especialidad LIKE ? OR telefono LIKE ? OR email LIKE ?)
            ORDER BY nombre, apellido
            LIMIT 20
          `;
          
          const terminoBusqueda = `%${termino}%`;
          conexion.query(sql, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
            if (!error) resultados.medicos = results;
            resolveMedicos();
          });
        }));
      }

      // Búsqueda de citas
      if (!tipo || tipo === 'citas') {
        promesas.push(new Promise((resolveCitas) => {
          const sql = `
            SELECT 
              c.id, c.fecha, c.hora, c.motivo, c.estado,
              p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.dni as paciente_dni,
              m.nombre as medico_nombre, m.apellido as medico_apellido, m.especialidad
            FROM citas c
            INNER JOIN pacientes p ON c.paciente_id = p.id
            INNER JOIN medicos m ON c.medico_id = m.id
            WHERE (p.nombre LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ? OR 
                   m.nombre LIKE ? OR m.apellido LIKE ? OR m.especialidad LIKE ? OR
                   c.motivo LIKE ? OR c.estado LIKE ?)
            ORDER BY c.fecha DESC, c.hora DESC
            LIMIT 20
          `;
          
          const terminoBusqueda = `%${termino}%`;
          conexion.query(sql, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
            if (!error) resultados.citas = results;
            resolveCitas();
          });
        }));
      }

      // Búsqueda de historial
      if (!tipo || tipo === 'historial') {
        promesas.push(new Promise((resolveHistorial) => {
          const sql = `
            SELECT 
              h.id, h.diagnostico, h.observaciones, h.tratamiento, h.fecha_atencion,
              p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.dni as paciente_dni,
              m.nombre as medico_nombre, m.apellido as medico_apellido
            FROM historial_atenciones h
            INNER JOIN pacientes p ON h.paciente_id = p.id
            INNER JOIN medicos m ON h.medico_id = m.id
            WHERE (p.nombre LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ? OR
                   m.nombre LIKE ? OR m.apellido LIKE ? OR
                   h.diagnostico LIKE ? OR h.observaciones LIKE ? OR h.tratamiento LIKE ?)
            ORDER BY h.fecha_atencion DESC
            LIMIT 20
          `;
          
          const terminoBusqueda = `%${termino}%`;
          conexion.query(sql, [terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda], (error, results) => {
            if (!error) resultados.historial = results;
            resolveHistorial();
          });
        }));
      }

      Promise.all(promesas).then(() => resolve());
    });
  };

  ejecutarBusquedas().then(() => {
    const totales = {
      pacientes: resultados.pacientes.length,
      medicos: resultados.medicos.length,
      citas: resultados.citas.length,
      historial: resultados.historial.length,
      total: resultados.pacientes.length + resultados.medicos.length + resultados.citas.length + resultados.historial.length
    };

    res.render('pages/busqueda/resultados', {
      title: `Búsqueda: ${termino}`,
      nombre: req.session.nombre,
      termino,
      resultados,
      totales,
      tipo: tipo || 'todos',
      layout: 'layouts/main'
    });
  });
};
