const conexion = require('../models/db');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// Ver página de reportes
exports.verReportes = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Obtener estadísticas generales
  const sqlEstadisticas = `
    SELECT 
      (SELECT COUNT(*) FROM pacientes) as total_pacientes,
      (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) as citas_hoy,
      (SELECT COUNT(*) FROM medicos WHERE estado = 1) as medicos_activos,
      (SELECT COUNT(*) FROM historial_atenciones WHERE MONTH(fecha_atencion) = MONTH(CURDATE()) AND YEAR(fecha_atencion) = YEAR(CURDATE())) as atenciones_mes
  `;

  conexion.query(sqlEstadisticas, (error, results) => {
    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.render('pages/reportes/index', {
        title: 'Reportes',
        nombre: req.session.nombre,
        estadisticas: {
          total_pacientes: 0,
          citas_hoy: 0,
          medicos_activos: 0,
          atenciones_mes: 0
        },
        layout: 'layouts/main'
      });
    }

    res.render('pages/reportes/index', {
      title: 'Reportes',
      nombre: req.session.nombre,
      estadisticas: results[0],
      layout: 'layouts/main'
    });
  });
};

// Reporte diario de citas
exports.reporteDiario = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      c.id,
      c.hora,
      c.motivo,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni,
      p.telefono AS paciente_telefono,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      s.nombre AS sede_nombre
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    INNER JOIN sedes s ON c.sede_id = s.id
    WHERE c.fecha = ?
    ORDER BY c.hora ASC
  `;

  conexion.query(sql, [fecha], (error, results) => {
    if (error) {
      console.error('Error al generar reporte diario:', error);
      return res.render('pages/reportes/diario', {
        title: 'Reporte Diario',
        nombre: req.session.nombre,
        citas: [],
        fecha,
        totalCitas: 0,
        citasProgramadas: 0,
        citasConfirmadas: 0,
        citasAtendidas: 0,
        citasCanceladas: 0,
        layout: 'layouts/main'
      });
    }

    // Estadísticas
    const totalCitas = results.length;
    const citasProgramadas = results.filter(c => c.estado === 'programada').length;
    const citasConfirmadas = results.filter(c => c.estado === 'confirmada').length;
    const citasAtendidas = results.filter(c => c.estado === 'atendida').length;
    const citasCanceladas = results.filter(c => c.estado === 'cancelada').length;

    res.render('pages/reportes/diario', {
      title: 'Reporte Diario',
      nombre: req.session.nombre,
      citas: results,
      fecha,
      totalCitas,
      citasProgramadas,
      citasConfirmadas,
      citasAtendidas,
      citasCanceladas,
      layout: 'layouts/main'
    });
  });
};

// Reporte semanal por médico
exports.reporteSemanal = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  // Calcular fecha de inicio y fin de la semana
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes);
  
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const fechaInicio = req.query.fecha_inicio || lunes.toISOString().split('T')[0];
  const fechaFin = req.query.fecha_fin || domingo.toISOString().split('T')[0];

  const sql = `
    SELECT 
      m.id AS medico_id,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad,
      COUNT(c.id) AS total_citas,
      SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) AS programadas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) AS atendidas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      SUM(CASE WHEN c.estado = 'no_show' THEN 1 ELSE 0 END) AS no_show
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha BETWEEN ? AND ?
    GROUP BY m.id, m.nombre, m.apellido, m.especialidad
    ORDER BY total_citas DESC
  `;

  conexion.query(sql, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      console.error('Error al generar reporte semanal:', error);
      return res.render('pages/reportes/semanal', {
        title: 'Reporte Semanal',
        nombre: req.session.nombre,
        medicos: [],
        fechaInicio,
        fechaFin,
        totalCitasSemana: 0,
        layout: 'layouts/main'
      });
    }

    const totalCitasSemana = results.reduce((sum, m) => sum + m.total_citas, 0);

    res.render('pages/reportes/semanal', {
      title: 'Reporte Semanal',
      nombre: req.session.nombre,
      medicos: results,
      fechaInicio,
      fechaFin,
      totalCitasSemana,
      layout: 'layouts/main'
    });
  });
};

// Exportar reporte diario a Excel
exports.exportarDiarioExcel = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      c.id,
      c.hora,
      c.motivo,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni,
      p.telefono AS paciente_telefono,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      s.nombre AS sede_nombre
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    INNER JOIN sedes s ON c.sede_id = s.id
    WHERE c.fecha = ?
    ORDER BY c.hora ASC
  `;

  conexion.query(sql, [fecha], (error, results) => {
    if (error) {
      console.error('Error al generar reporte diario Excel:', error);
      return res.status(500).send('Error al generar el reporte');
    }

    // Preparar datos para Excel
    const datosExcel = results.map(cita => ({
      'ID': cita.id,
      'Hora': cita.hora,
      'Paciente': `${cita.paciente_nombre} ${cita.paciente_apellido}`,
      'DNI': cita.paciente_dni,
      'Teléfono': cita.paciente_telefono,
      'Médico': `${cita.medico_nombre} ${cita.medico_apellido}`,
      'Especialidad': cita.medico_especialidad,
      'Sede': cita.sede_nombre,
      'Motivo': cita.motivo,
      'Estado': cita.estado
    }));

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 10 }, // Hora
      { wch: 25 }, // Paciente
      { wch: 12 }, // DNI
      { wch: 15 }, // Teléfono
      { wch: 25 }, // Médico
      { wch: 20 }, // Especialidad
      { wch: 15 }, // Sede
      { wch: 30 }, // Motivo
      { wch: 12 }  // Estado
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Diario');

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const nombreArchivo = `reporte_diario_${fecha}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    res.send(buffer);
  });
};

// Exportar reporte diario a PDF
exports.exportarDiarioPDF = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fecha = req.query.fecha || new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      c.id,
      c.hora,
      c.motivo,
      c.estado,
      p.nombre AS paciente_nombre,
      p.apellido AS paciente_apellido,
      p.dni AS paciente_dni,
      p.telefono AS paciente_telefono,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad AS medico_especialidad,
      s.nombre AS sede_nombre
    FROM citas c
    INNER JOIN pacientes p ON c.paciente_id = p.id
    INNER JOIN medicos m ON c.medico_id = m.id
    INNER JOIN sedes s ON c.sede_id = s.id
    WHERE c.fecha = ?
    ORDER BY c.hora ASC
  `;

  conexion.query(sql, [fecha], (error, results) => {
    if (error) {
      console.error('Error al generar reporte diario PDF:', error);
      return res.status(500).send('Error al generar el reporte');
    }

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para descarga
    const nombreArchivo = `reporte_diario_${fecha}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text('Reporte Diario de Citas', { align: 'center' });
    doc.fontSize(14).text(`Fecha: ${fecha}`, { align: 'center' });
    doc.moveDown(2);

    // Estadísticas
    const totalCitas = results.length;
    const citasProgramadas = results.filter(c => c.estado === 'programada').length;
    const citasConfirmadas = results.filter(c => c.estado === 'confirmada').length;
    const citasAtendidas = results.filter(c => c.estado === 'atendida').length;
    const citasCanceladas = results.filter(c => c.estado === 'cancelada').length;

    doc.fontSize(12).text('Estadísticas:', { underline: true });
    doc.text(`Total de citas: ${totalCitas}`);
    doc.text(`Programadas: ${citasProgramadas}`);
    doc.text(`Confirmadas: ${citasConfirmadas}`);
    doc.text(`Atendidas: ${citasAtendidas}`);
    doc.text(`Canceladas: ${citasCanceladas}`);
    doc.moveDown(2);

    // Tabla de citas
    if (results.length > 0) {
      doc.fontSize(12).text('Detalle de Citas:', { underline: true });
      doc.moveDown(1);

      // Encabezados de tabla
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [40, 50, 80, 60, 80, 60];
      const rowHeight = 20;

      // Dibujar encabezados
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Hora', tableLeft, tableTop);
      doc.text('Paciente', tableLeft + colWidths[0], tableTop);
      doc.text('Médico', tableLeft + colWidths[0] + colWidths[1], tableTop);
      doc.text('Especialidad', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
      doc.text('Sede', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
      doc.text('Estado', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);

      // Dibujar línea debajo de encabezados
      doc.moveTo(tableLeft, tableTop + 15)
         .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
         .stroke();

      // Datos de la tabla
      doc.font('Helvetica');
      let currentY = tableTop + rowHeight;

      results.forEach((cita, index) => {
        if (currentY > 700) { // Nueva página si es necesario
          doc.addPage();
          currentY = 50;
        }

        doc.fontSize(9);
        doc.text(cita.hora, tableLeft, currentY);
        doc.text(`${cita.paciente_nombre} ${cita.paciente_apellido}`, tableLeft + colWidths[0], currentY);
        doc.text(`${cita.medico_nombre} ${cita.medico_apellido}`, tableLeft + colWidths[0] + colWidths[1], currentY);
        doc.text(cita.medico_especialidad, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY);
        doc.text(cita.sede_nombre, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY);
        doc.text(cita.estado, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY);

        currentY += rowHeight;
      });
    } else {
      doc.text('No hay citas programadas para esta fecha.');
    }

    doc.end();
  });
};

// Exportar reporte semanal a Excel
exports.exportarSemanalExcel = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fechaInicio = req.query.fecha_inicio;
  const fechaFin = req.query.fecha_fin;

  const sql = `
    SELECT 
      m.id AS medico_id,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad,
      COUNT(c.id) AS total_citas,
      SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) AS programadas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) AS atendidas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      SUM(CASE WHEN c.estado = 'no_show' THEN 1 ELSE 0 END) AS no_show
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha BETWEEN ? AND ?
    GROUP BY m.id, m.nombre, m.apellido, m.especialidad
    ORDER BY total_citas DESC
  `;

  conexion.query(sql, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      console.error('Error al generar reporte semanal Excel:', error);
      return res.status(500).send('Error al generar el reporte');
    }

    // Preparar datos para Excel
    const datosExcel = results.map(medico => ({
      'Médico': `${medico.medico_nombre} ${medico.medico_apellido}`,
      'Especialidad': medico.especialidad,
      'Total Citas': medico.total_citas,
      'Programadas': medico.programadas,
      'Confirmadas': medico.confirmadas,
      'Atendidas': medico.atendidas,
      'Canceladas': medico.canceladas,
      'No Show': medico.no_show
    }));

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 25 }, // Médico
      { wch: 20 }, // Especialidad
      { wch: 12 }, // Total Citas
      { wch: 12 }, // Programadas
      { wch: 12 }, // Confirmadas
      { wch: 12 }, // Atendidas
      { wch: 12 }, // Canceladas
      { wch: 12 }  // No Show
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Semanal');

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Configurar headers para descarga
    const nombreArchivo = `reporte_semanal_${fechaInicio}_${fechaFin}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    res.send(buffer);
  });
};

// Exportar reporte semanal a PDF
exports.exportarSemanalPDF = (req, res) => {
  if (!req.session.loggedin) return res.redirect('/login');

  const fechaInicio = req.query.fecha_inicio;
  const fechaFin = req.query.fecha_fin;

  const sql = `
    SELECT 
      m.id AS medico_id,
      m.nombre AS medico_nombre,
      m.apellido AS medico_apellido,
      m.especialidad,
      COUNT(c.id) AS total_citas,
      SUM(CASE WHEN c.estado = 'programada' THEN 1 ELSE 0 END) AS programadas,
      SUM(CASE WHEN c.estado = 'confirmada' THEN 1 ELSE 0 END) AS confirmadas,
      SUM(CASE WHEN c.estado = 'atendida' THEN 1 ELSE 0 END) AS atendidas,
      SUM(CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      SUM(CASE WHEN c.estado = 'no_show' THEN 1 ELSE 0 END) AS no_show
    FROM medicos m
    LEFT JOIN citas c ON m.id = c.medico_id 
      AND c.fecha BETWEEN ? AND ?
    GROUP BY m.id, m.nombre, m.apellido, m.especialidad
    ORDER BY total_citas DESC
  `;

  conexion.query(sql, [fechaInicio, fechaFin], (error, results) => {
    if (error) {
      console.error('Error al generar reporte semanal PDF:', error);
      return res.status(500).send('Error al generar el reporte');
    }

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para descarga
    const nombreArchivo = `reporte_semanal_${fechaInicio}_${fechaFin}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text('Reporte Semanal por Médico', { align: 'center' });
    doc.fontSize(14).text(`Período: ${fechaInicio} - ${fechaFin}`, { align: 'center' });
    doc.moveDown(2);

    // Estadísticas generales
    const totalCitasSemana = results.reduce((sum, m) => sum + m.total_citas, 0);
    doc.fontSize(12).text('Estadísticas Generales:', { underline: true });
    doc.text(`Total de citas en el período: ${totalCitasSemana}`);
    doc.text(`Médicos con citas: ${results.filter(m => m.total_citas > 0).length}`);
    doc.moveDown(2);

    // Tabla de médicos
    if (results.length > 0) {
      doc.fontSize(12).text('Resumen por Médico:', { underline: true });
      doc.moveDown(1);

      // Encabezados de tabla
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [80, 60, 50, 50, 50, 50, 50, 50];
      const rowHeight = 20;

      // Dibujar encabezados
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Médico', tableLeft, tableTop);
      doc.text('Especialidad', tableLeft + colWidths[0], tableTop);
      doc.text('Total', tableLeft + colWidths[0] + colWidths[1], tableTop);
      doc.text('Prog.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
      doc.text('Conf.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
      doc.text('Atend.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);
      doc.text('Cancel.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], tableTop);
      doc.text('No Show', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], tableTop);

      // Dibujar línea debajo de encabezados
      doc.moveTo(tableLeft, tableTop + 15)
         .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
         .stroke();

      // Datos de la tabla
      doc.font('Helvetica');
      let currentY = tableTop + rowHeight;

      results.forEach((medico, index) => {
        if (currentY > 700) { // Nueva página si es necesario
          doc.addPage();
          currentY = 50;
        }

        doc.fontSize(9);
        doc.text(`${medico.medico_nombre} ${medico.medico_apellido}`, tableLeft, currentY);
        doc.text(medico.especialidad, tableLeft + colWidths[0], currentY);
        doc.text(medico.total_citas.toString(), tableLeft + colWidths[0] + colWidths[1], currentY);
        doc.text(medico.programadas.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY);
        doc.text(medico.confirmadas.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY);
        doc.text(medico.atendidas.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY);
        doc.text(medico.canceladas.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], currentY);
        doc.text(medico.no_show.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], currentY);

        currentY += rowHeight;
      });
    } else {
      doc.text('No hay datos para el período seleccionado.');
    }

    doc.end();
  });
};

