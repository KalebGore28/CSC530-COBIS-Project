import express from 'express';
import { importData, convertDateDDMMYYYY } from './helpers.js';

const router = express.Router();

router.post('/overrides', async (req, res) => {
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
				year: parseInt(termMatch[1]),
				crn: row.crn,
				subject: row.subj,
				course_number: parseInt(courseMatch[1], 10),
				course_suffix: courseMatch[2] || '',
				section: row.section,
				override_type: row.override,
				granted_by: row.userid,
				override_date: convertDateDDMMYYYY(row.activitydate)
			};
		}).filter(row => row !== null); // Remove invalid rows

		// Define column types for SQL binding
		const columnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			crn: 'nvarchar',
			subject: 'nvarchar',
			course_number: 'int',
			course_suffix: 'nvarchar',
			section: 'nvarchar',
			override_type: 'nvarchar',
			granted_by: 'nvarchar',
			override_date: 'datetime'
		};


		const result = await importData('overrides', 'mnumber', transformedData, fileName, importedBy, columnTypes);
		res.json({
			message: 'Overrides imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing override data: ${error.message}`);
		res.status(500).json({ error: 'Error importing override data.' });
	}
});

export default router;