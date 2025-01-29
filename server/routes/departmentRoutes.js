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
  const { mappedData, fileName, importedBy } = req.body;

  if (!Array.isArray(mappedData) || mappedData.length === 0) {
    return res.status(400).json({ error: 'Invalid CSV data.' });
  }

  let totalRecords = mappedData.length;
  let errorDetails = [];

  try {
    for (const row of mappedData) {
      const { code, description, prefixes, canvas_id, college } = row;

      try {
        // ✅ Step 1: Ensure the record exists (INSERT if it doesn’t exist)
        await db.run(
          `INSERT OR IGNORE INTO departments (code, description, prefixes, canvas_id, college)
           VALUES (?, ?, ?, ?, ?)`,
          [code || '', description || '', prefixes || '', canvas_id || '', college || '']
        );

        // ✅ Step 2: Update only provided fields if record exists
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

        if (fieldsToUpdate.length > 0) {
          values.push(code);
          await db.run(
            `UPDATE departments
             SET ${fieldsToUpdate.join(', ')}
             WHERE code = ?`,
            values
          );
        }
      } catch (error) {
        errorDetails.push({ row, error: error.message });
      }
    }

    // ✅ Log the import in `imports` table
    await db.run(
      `INSERT INTO imports (entity_type, file_name, total_records, error_details, import_status, imported_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'departments',
        fileName || 'Unknown File',
        totalRecords,
        errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
        'Completed',
        importedBy || 'System'
      ]
    );

    res.json({ message: 'Departments imported successfully.', totalRecords });
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