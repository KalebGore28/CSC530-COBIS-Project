import express from 'express';
import { importData } from './helpers.js';

const router = express.Router();

router.post('/student_courses', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map(row => {
			const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

			if (!termMatch) {
				console.warn(`⚠ Invalid TERM format: ${row.term}`);
				return null; // Skip invalid rows
			}

			// Separate optional course suffix from course number
			const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);

			return {
				mnumber: row.mnumber,
				term: termMatch[2],
				year: parseInt(termMatch[1], 10),
				part_of_term: row.partofterm,
				crn: row.crn,
				subject: row.crsesubj,
				course_number: parseInt(courseMatch[1], 10),
				course_suffix: courseMatch[2] || '',
				section: row.section,
				hours: parseFloat(row.crhrs) || 0,
				level: row.levlcode,
				registration_status: row.rstscode,
				instructional_method: row.insmcode,
				last_attendance: row.lastattend,
				midterm_grade: row.midgrade,
				final_grade: row.fingrade,
			};
		}).filter(row => row !== null); // Remove invalid rows

		const columnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			crn: 'nvarchar',
			subject: 'nvarchar',
			course_number: 'int',
			course_suffix: 'nvarchar',
			section: 'nvarchar',
			hours: 'decimal',
			level: 'nvarchar',
			registration_status: 'nvarchar',
			instructional_method: 'nvarchar',
			last_attendance: 'datetime',
			midterm_grade: 'nvarchar',
			final_grade: 'nvarchar',
		};

		const result = await importData('student_courses', ['mnumber', 'term', 'year', 'crn'], transformedData, fileName, importedBy, columnTypes);
		res.json({
			message: 'Student Courses imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing Student Courses data: ${error.message}`);
		res.status(500).json({ error: 'Error importing Student Courses data.' });
	}
});

export default router;