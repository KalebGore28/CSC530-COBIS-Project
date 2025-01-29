// server/server.js
const express = require('express');
const cors = require('cors');
const db = require('./database');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// 1) Define your fonts for pdfmake
//    You must provide at least 'normal', others are optional
let fonts = {
  Roboto: {
    normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
    // bold: path.join(__dirname, 'fonts', 'Roboto-Bold.ttf'),
    // italics: ...
    // bolditalics: ...
  },
};

// 2) Create a PdfPrinter instance
let printer = new PdfPrinter(fonts);

// 3) Endpoint: fetch employees, generate PDF, send it
app.get('/api/report-pdf', (req, res) => {
  // Query employees from DB
  db.all(`SELECT * FROM employees`, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    // Build a simple "body" array for a table
    // First row is table headers
    const tableBody = [
      [{ text: 'ID' }, { text: 'Name' }, { text: 'Position' }, { text: 'Salary' }],
    ];

    // Append each employee as a row
    rows.forEach((emp) => {
      tableBody.push([emp.id, emp.name, emp.position, emp.salary]);
    });

    // docDefinition: pdfmake's instructions
    let docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'Employee Report', style: 'header' },
        {
          table: {
            widths: ['auto', '*', '*', 'auto'],
            body: tableBody,
          },
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          alignment: 'center',
        },
      },
    };

    // Create PDF readable stream
    let pdfDoc = printer.createPdfKitDocument(docDefinition);

    // We'll collect the PDF into a buffer, then send
    let chunks = [];
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      // Send the PDF as a download
      res.setHeader('Content-Type', 'application/pdf');
      // If you want it as a download:
      res.setHeader('Content-Disposition', 'attachment; filename=employee-report.pdf');
      res.send(pdfBuffer);
    });

    // End the PDF generation
    pdfDoc.end();
  });
});


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});