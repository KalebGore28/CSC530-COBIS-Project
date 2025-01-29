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
			const { course, title, hours, course_fee, web_fee } = row;

			await db.run(
				`INSERT INTO courses (course, title, hours, course_fee, web_fee)
		  VALUES (?, ?, ?, ?, ?)
		  ON CONFLICT(course) DO UPDATE 
		  SET title = excluded.title,
			  hours = excluded.hours,
			  course_fee = excluded.course_fee,
			  web_fee = excluded.web_fee`,
				[course, title, hours, course_fee, web_fee]
			);
		}

		res.json({ message: 'Course titles imported/updated successfully.' });
	} catch (error) {
		console.error('Error importing course titles:', error);
		res.status(500).json({ error: 'Error importing course titles.' });
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
			const columnWidths = ['auto', '*', 'auto', 'auto', 'auto']; // Adjust title column for readability

			// Generate the PDF
			const pdfBuffer = await generatePDF('Courses Report', headers, data, { columnWidths });

			// Send the PDF response
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