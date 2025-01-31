import express from 'express';
const router = express.Router();
import { poolPromise } from '../db.js';
import generatePDF from '../utils/pdfGenerator.js';
import isFalsy from '../utils/isFalsy.js';
import sql from 'mssql';

// 📌 Endpoint: Get column names for the courses table
router.get('/column-names', async (req, res) => {
  const tableName = 'courses';

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

// 📌 Endpoint: Import mapped CSV data into the courses table
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
      const { course, title, hours, course_fee, web_fee } = row;

      try {
        // ✅ Step 1: Ensure the record exists (INSERT if it doesn’t exist)
        const query = `
          MERGE INTO courses AS target
          USING (SELECT @course AS course, @title AS title, @hours AS hours, 
                        @course_fee AS course_fee, @web_fee AS web_fee) AS source
          ON target.course = source.course
          WHEN NOT MATCHED THEN
            INSERT (course, title, hours, course_fee, web_fee)
            VALUES (source.course, source.title, source.hours, source.course_fee, source.web_fee);
        `;

        await pool.request()
          .input('course', sql.NVarChar, isFalsy(course) ? null : course)
          .input('title', sql.NVarChar, isFalsy(title) ? null : title)
          .input('hours', sql.Int, isFalsy(hours) ? 0.0 : hours)
		  .input('course_fee', sql.Decimal(10, 2), isFalsy(course_fee) ? 0.0 : course_fee)
		  .input('web_fee', sql.Decimal(10, 2), isFalsy(web_fee) ? 0.0 : web_fee)
          .query(query);

        // ✅ Step 2: Update only provided fields
        const fieldsToUpdate = [];
        if (!isFalsy(title)) fieldsToUpdate.push(`title = @title`);
        if (!isFalsy(hours)) fieldsToUpdate.push(`hours = @hours`);
        if (!isFalsy(course_fee)) fieldsToUpdate.push(`course_fee = @course_fee`);
        if (!isFalsy(web_fee)) fieldsToUpdate.push(`web_fee = @web_fee`);

        if (fieldsToUpdate.length > 0) {
          const updateQuery = `
            UPDATE courses
            SET ${fieldsToUpdate.join(', ')}
            WHERE course = @course
          `;

          await pool.request()
            .input('course', sql.NVarChar, isFalsy(course) ? null : course)
            .input('title', sql.NVarChar, isFalsy(title) ? null : title)
            .input('hours', sql.Int,isFalsy(hours) ? 0.0 : hours) 
			.input('course_fee', sql.Decimal(10, 2), isFalsy(course_fee) ? 0.0 : course_fee)
			.input('web_fee', sql.Decimal(10, 2), isFalsy(web_fee) ? 0.0 : web_fee)
            .query(updateQuery);
        }
      } catch (error) {
        errorDetails.push({ row, error: error.message });
		console.log(row, error.message);
      }
    }

    // ✅ Log import in `imports` table
    const importQuery = `
      INSERT INTO imports (entity_type, file_name, total_records, error_details, import_status, imported_by)
      VALUES (@entity_type, @file_name, @total_records, @error_details, @import_status, @imported_by)
    `;

    await pool.request()
      .input('entity_type', sql.NVarChar, 'courses')
      .input('file_name', sql.NVarChar, fileName || 'Unknown File')
      .input('total_records', sql.Int, totalRecords)
      .input('error_details', sql.NVarChar, errorDetails.length > 0 ? JSON.stringify(errorDetails) : null)
      .input('import_status', sql.NVarChar, 'Completed')
      .input('imported_by', sql.NVarChar, importedBy || 'System')
      .query(importQuery);

    res.json({ message: 'Courses imported successfully.', totalRecords });
  } catch (error) {
    console.error('Error importing course data:', error);
    res.status(500).json({ error: 'Error importing course data.' });
  }
});

// 📌 Endpoint: Generate a PDF report of courses
router.get('/pdf-report', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM courses`);

    const rows = result.recordset;

    // Define table headers
    const headers = [
      { text: 'Course', bold: true },
      { text: 'Title', bold: true },
      { text: 'Hours', bold: true },
      { text: 'Course Fee', bold: true },
      { text: 'Web Fee', bold: true }
    ];

    // Map course data for the table
    const data = rows.map(course => [
      course.course || 'N/A',
      course.title || 'N/A',
      course.hours || '0',
      typeof course.course_fee === 'number' ? `$${course.course_fee.toFixed(2)}` : 'N/A',
      typeof course.web_fee === 'number' ? `$${course.web_fee.toFixed(2)}` : 'N/A'
    ]);

    // Set custom column widths
    const columnWidths = ['auto', '*', 'auto', 'auto', 'auto'];

    // Generate the PDF
    const pdfBuffer = await generatePDF('Courses Report', headers, data, { columnWidths });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=courses-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
});

export default router;