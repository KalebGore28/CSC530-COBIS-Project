const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { generatePDF } = require('../utils/pdfGenerator');

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

      // Build dynamic update fields
      const fieldsToUpdate = [];
      const values = [];

      if (description !== undefined) {
        fieldsToUpdate.push('description = ?');
        values.push(description);
      }
      if (prefixes !== undefined) {
        fieldsToUpdate.push('prefixes = ?');
        values.push(prefixes);
      }
      if (canvas_id !== undefined) {
        fieldsToUpdate.push('canvas_id = ?');
        values.push(canvas_id);
      }
      if (college !== undefined) {
        fieldsToUpdate.push('college = ?');
        values.push(college);
      }

      // If no fields to update, skip row
      if (fieldsToUpdate.length === 0) continue;

      values.push(code); // Add 'code' as the WHERE condition

      const updateQuery = `
        UPDATE departments
        SET ${fieldsToUpdate.join(', ')}
        WHERE code = ?
      `;

      await db.run(updateQuery, values);
    }

    res.json({ message: 'Departments imported/updated successfully.' });
  } catch (error) {
    console.error('Error importing department data:', error);
    res.status(500).json({ error: 'Error importing department data.' });
  }
});

// Endpoint: Generate Department Report as PDF
router.get('/pdf-report', async (req, res) => {
  try {
    db.all(`SELECT * FROM departments`, async (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).send('Database error');
      }

      // Define table headers
      const headers = [
        { text: 'Code', bold: true },
        { text: 'Description', bold: true },
        { text: 'College', bold: true }
      ];

      // Map department data for the table
      const data = rows.map(dept => [
        dept.code || 'N/A',
        dept.description || 'N/A',
        dept.college || 'N/A'
      ]);

      // Set custom column widths
      const columnWidths = ['auto', '*', 'auto'];

      // Generate the PDF
      const pdfBuffer = await generatePDF('Department Report', headers, data, { columnWidths });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=department-report.pdf');
      res.send(pdfBuffer);
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});


module.exports = router;