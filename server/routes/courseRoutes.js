const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { generatePDF } = require('../utils/pdfGenerator');;

// Endpoint: Get column names for the course titles table
router.get('/column-names', (req, res) => {
	const tableName = 'courses'; // Fixed table name for now
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

// Endpoint: Import mapped CSV data into the course titles table
router.post('/import', async (req, res) => {
	const { mappedData } = req.body;
  
	if (!Array.isArray(mappedData) || mappedData.length === 0) {
	  return res.status(400).json({ error: 'Invalid CSV data.' });
	}
  
	try {
	  for (const row of mappedData) {
		const { course, crsetitle, crhrs, course_fee, web_fee } = row;
  
		// Build dynamic update fields
		const fieldsToUpdate = [];
		const values = [];
  
		if (crsetitle !== undefined) {
		  fieldsToUpdate.push('crsetitle = ?');
		  values.push(crsetitle);
		}
		if (crhrs !== undefined) {
		  fieldsToUpdate.push('crhrs = ?');
		  values.push(crhrs);
		}
		if (course_fee !== undefined) {
		  fieldsToUpdate.push('course_fee = ?');
		  values.push(course_fee);
		}
		if (web_fee !== undefined) {
		  fieldsToUpdate.push('web_fee = ?');
		  values.push(web_fee);
		}
  
		// ✅ If no fields to update, skip row
		if (fieldsToUpdate.length === 0) continue;
  
		values.push(course); // Add 'course' as the WHERE condition
  
		const updateQuery = `
		  UPDATE courses
		  SET ${fieldsToUpdate.join(', ')}
		  WHERE course = ?
		`;
  
		await db.run(updateQuery, values);
	  }
  
	  res.json({ message: 'Courses imported/updated successfully.' });
	} catch (error) {
	  console.error('Error importing course data:', error);
	  res.status(500).json({ error: 'Error importing course data.' });
	}
  });

// Endpoint: Generate a PDF report of course titles
router.get('/pdf-report', async (req, res) => {
	try {
	  db.all(`SELECT * FROM courses`, async (err, rows) => {
		if (err) {
		  console.error('Error fetching data:', err);
		  return res.status(500).send('Database error');
		}
  
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
	  });
	} catch (error) {
	  console.error('Error generating report:', error);
	  res.status(500).json({ error: 'Error generating report' });
	}
  });

module.exports = router;