const express = require('express');
const router = express.Router();
const db = require('../database/db');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Define fonts required by pdfmake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Bold.ttf'),
  },
};

// Create a PdfPrinter instance
const printer = new PdfPrinter(fonts);

// Endpoint: Get column names for the departments table
router.get('/column-names', (req, res) => {
  const tableName = 'departments'; // Fixed table name for now
  db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
    if (err) {
      console.error(`Error fetching column names for table ${tableName}:`, err);
      return res.status(500).send('Error retrieving table columns');
    }

    const columnNames = rows.map((row) => row.name);
    res.json({
      table: tableName,
      columns: columnNames,
    });
  });
});

// Endpoint: Import mapped CSV data into the departments table
router.post('/import', async (req, res) => {
  const { mappedData } = req.body;

  if (!Array.isArray(mappedData) || mappedData.length === 0) {
    return res.status(400).json({ error: 'Invalid CSV data.' });
  }

  try {
    for (const row of mappedData) {
      const { code, description, prefixes, canvas_id, college } = row;

      await db.run(
        `INSERT INTO departments (code, description, prefixes, canvas_id, college)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(code) DO UPDATE 
         SET description = excluded.description,
             prefixes = excluded.prefixes,
             canvas_id = excluded.canvas_id,
             college = excluded.college`,
        [code, description, prefixes, canvas_id, college]
      );
    }

    res.json({ message: 'Departments imported/updated successfully.' });
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ error: 'Database error while importing departments.' });
  }
});

// Endpoint: Generate Department Report as PDF
router.get('/pdf-report', async (req, res) => {
  try {
    // Fetch departments from the database
    db.all(`SELECT * FROM departments`, (err, rows) => {
      if (err) {
				console.error(`Error fetching data from Department Table.`, err);
        return res.status(500).send('Database error');
      }

      // Construct table body: First row is the header
      const tableBody = [
        [{ text: 'ID', bold: true }, { text: 'Code', bold: true }, { text: 'Description', bold: true }, { text: 'College', bold: true }]
      ];

      // Append department data
      rows.forEach((dept) => {
        tableBody.push([dept.id, dept.code, dept.description, dept.college || '']);
      });

      // Define PDF document structure
      let docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [
          { text: 'Department Report', style: 'header' },
          {
            table: {
              widths: ['auto', 'auto', '*', 'auto'],
              body: tableBody,
            },
            margin: [0, 20, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
        },
      };

      // Create a PDF document
      let pdfDoc = printer.createPdfKitDocument(docDefinition);

      // Collect PDF data into a buffer
      let chunks = [];
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=department-report.pdf');
        res.send(pdfBuffer);
      });

      // Finalize PDF creation
      pdfDoc.end();
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate department report' });
  }
});

module.exports = router;