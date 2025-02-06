import express from 'express';
const router = express.Router();
import { poolPromise } from '../db.js';
import generatePDF from '../utils/pdfGenerator.js';
import isFalsy from '../utils/isFalsy.js';
import sql from 'mssql';

// 📌 Endpoint: Get column names for the departments table
router.get('/column-names', async (req, res) => {
  const tableName = 'departments';

  try {
    const pool = await poolPromise;
    const query = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
    `;
    const result = await pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .query(query);

    const columnNames = result.recordset.map(row => row.COLUMN_NAME);
    res.json({ table: tableName, columns: columnNames });
  } catch (error) {
    console.error(`Error fetching column names for table ${tableName}:`, error);
    res.status(500).send('Error retrieving table columns');
  }
});

// 📌 Endpoint: Import mapped CSV data into the departments table
router.post('/import', async (req, res) => {
  const { mappedData, fileName, importedBy } = req.body;

  if (!Array.isArray(mappedData) || mappedData.length === 0) {
    return res.status(400).json({ error: 'Invalid CSV data.' });
  }

  let totalRecords = mappedData.length;
  let errorDetails = [];

  try {
    const pool = await poolPromise;

    for (const row of mappedData) {
      const { code, description, prefixes, canvas_id, college } = row;

      try {
        // ✅ Step 1: Ensure the record exists (INSERT if it doesn’t exist)
        const query = `
          MERGE INTO departments AS target
          USING (SELECT @code AS code, @description AS description, 
                        @prefixes AS prefixes, @canvas_id AS canvas_id, 
                        @college AS college) AS source
          ON target.code = source.code
          WHEN NOT MATCHED THEN
            INSERT (code, description, prefixes, canvas_id, college)
            VALUES (source.code, source.description, source.prefixes, source.canvas_id, source.college);
        `;

        await pool.request()
          .input('code', sql.NVarChar, isFalsy(code) ? null : code)
          .input('description', sql.NVarChar, isFalsy(description) ? null : description)
          .input('prefixes', sql.NVarChar, isFalsy(prefixes) ? null : prefixes)
          .input('canvas_id', sql.Int, isFalsy(canvas_id) ? null : parseInt(canvas_id, 10))
          .input('college', sql.NVarChar, isFalsy(college) ? null : college)
          .query(query);

        // ✅ Step 2: Update only provided fields if record exists
        const fieldsToUpdate = [];
        if (!isFalsy(description)) fieldsToUpdate.push(`description = @description`);
        if (!isFalsy(prefixes)) fieldsToUpdate.push(`prefixes = @prefixes`);
        if (!isFalsy(canvas_id)) fieldsToUpdate.push(`canvas_id = @canvas_id`);
        if (!isFalsy(college)) fieldsToUpdate.push(`college = @college`);

        if (fieldsToUpdate.length > 0) {
          const updateQuery = `
            UPDATE departments
            SET ${fieldsToUpdate.join(', ')}
            WHERE code = @code
          `;

          await pool.request()
            .input('code', sql.NVarChar, isFalsy(code) ? null : code)
            .input('description', sql.NVarChar, isFalsy(description) ? null : description)
            .input('prefixes', sql.NVarChar, isFalsy(prefixes) ? null : prefixes)
            .input('canvas_id', sql.Int, isFalsy(canvas_id) ? null : parseInt(canvas_id, 10))
            .input('college', sql.NVarChar, isFalsy(college) ? null : college)
            .query(updateQuery);
        }
      } catch (error) {
        errorDetails.push({ row, error: error.message });
        console.log(`Error importing row:`, error.message);
      }
    }

    // ✅ Log the import in `imports` table
    const importQuery = `
      INSERT INTO imports (entity_type, file_name, total_records, error_details, import_status, imported_by)
      VALUES (@entity_type, @file_name, @total_records, @error_details, @import_status, @imported_by)
    `;

    await pool.request()
      .input('entity_type', sql.NVarChar, 'departments')
      .input('file_name', sql.NVarChar, fileName || 'Unknown File')
      .input('total_records', sql.Int, totalRecords)
      .input('error_details', sql.NVarChar, errorDetails.length > 0 ? JSON.stringify(errorDetails) : null)
      .input('import_status', sql.NVarChar, 'Completed')
      .input('imported_by', sql.NVarChar, importedBy || 'System')
      .query(importQuery);

    res.json({ message: 'Departments imported successfully.', totalRecords });
  } catch (error) {
    res.status(500).json({ error: 'Error importing department data.' });
  }
});

// 📌 Endpoint: Generate Department Report as PDF
router.get('/pdf-report', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM departments`);

    const rows = result.recordset;

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
  } catch (error) {
    res.status(500).json({ error: 'Error generating report' });
    console.error('Error generating report:', error);

  }
});

export default router;