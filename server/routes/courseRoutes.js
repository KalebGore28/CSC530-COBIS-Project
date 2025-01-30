const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { generatePDF } = require('../utils/pdfGenerator');

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
	const { mappedData, fileName, importedBy } = req.body;

	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		return res.status(400).json({ error: 'Invalid CSV data.' });
	}

	let totalRecords = mappedData.length;
	let errorDetails = [];

	try {
		for (const row of mappedData) {
			const { course, title, hours, course_fee, web_fee } = row;

			try {
				// ✅ Step 1: Ensure the record exists (INSERT if it doesn’t exist)
				await db.run(
					`INSERT OR IGNORE INTO courses (course, title, hours, course_fee, web_fee)
					 VALUES (?, ?, ?, ?, ?)`,
					[course || '', title || '', hours || 0, course_fee || null, web_fee || null]
				);

				// ✅ Step 2: Update only provided fields
				const fieldsToUpdate = [];
				const values = [];

				if (title !== undefined) {
					fieldsToUpdate.push('title = ?');
					values.push(title);
				}
				if (hours !== undefined) {
					fieldsToUpdate.push('hours = ?');
					values.push(hours);
				}
				if (course_fee !== undefined) {
					fieldsToUpdate.push('course_fee = ?');
					values.push(course_fee);
				}
				if (web_fee !== undefined) {
					fieldsToUpdate.push('web_fee = ?');
					values.push(web_fee);
				}

				if (fieldsToUpdate.length > 0) {
					values.push(course);
					await db.run(
						`UPDATE courses
						SET ${fieldsToUpdate.join(', ')}
						WHERE course = ?`,
						values
					);
				}
			} catch (error) {
				errorDetails.push({ row, error: error.message });
			}
		}

		// ✅ Log import in `imports` table
		await db.run(
			`INSERT INTO imports (entity_type, file_name, total_records, error_details, import_status, imported_by)
			VALUES (?, ?, ?, ?, ?, ?)`,
			[
				'courses',
				fileName || 'Unknown File',
				totalRecords,
				errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
				'Completed',
				importedBy || 'System'
			]
		);

		res.json({ message: 'Courses imported successfully.', totalRecords });
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