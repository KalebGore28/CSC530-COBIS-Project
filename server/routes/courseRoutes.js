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
// columns: course,title,hours,course_fee,web_fee,last_changed

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
		db.all(`SELECT * FROM courses`, (err, rows) => {
			if (err) {
				console.error(`Error fetching data from Courses Table.`, err);
				return res.status(500).send('Error fetching data');
			}

			// Construct table body: First row is the header
			const tableBody = [
				[
					{ text: 'Course', bold: true },
					{ text: 'Title', bold: true },
					{ text: 'Hours', bold: true },
					{ text: 'Course Fee', bold: true },
					{ text: 'Web Fee', bold: true }
				],
			];

			// Append course data, ensuring NULL values are handled
			rows.forEach((course) => {
				tableBody.push([
					course.course || 'N/A',
					course.title || 'N/A',
					course.hours || '0',
					course.course_fee !== null ? `$${course.course_fee.toFixed(2)}` : 'N/A',
					course.web_fee !== null ? `$${course.web_fee.toFixed(2)}` : 'N/A'
				]);
			});

			// Define PDF document structure
			let docDefinition = {
				pageSize: 'A4',
				pageMargins: [40, 60, 40, 60],
				content: [
					{ text: 'Courses Report', style: 'header' },
					{
						table: {
							widths: ['auto', '*', 'auto', 'auto', 'auto'], // Adjusted widths
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
			const pdfDoc = printer.createPdfKitDocument(docDefinition);

			// Collect PDF data into a buffer
			let chunks = [];
			pdfDoc.on('data', (chunk) => {
				chunks.push(chunk);
			});

			pdfDoc.on('end', () => {
				const pdfBuffer = Buffer.concat(chunks);
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader('Content-Disposition', 'attachment; filename=courses-report.pdf');
				res.send(pdfBuffer);
			});

			// Finalize PDF creation
			pdfDoc.end();
		});
	} catch (error) {
		console.error('Error generating report:', error);
		res.status(500).json({ error: 'Error generating report' });
	}
});

module.exports = router;