import express from 'express';
import { importData } from './helpers.ts';

const router = express.Router();

router.post('/courses', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map(row => {

			const courseMatch = row.course.match(/^([A-Za-z]+)(\d+)([A-Za-z]*)$/);

			if (!courseMatch) {
				console.warn(`⚠ Invalid COURSE format: ${row.course}`);
				return null; // Skip invalid rows
			}

			return {
				subject: courseMatch[1],          // Extracts the subject (e.g., "ACC")
				course_number: parseInt(courseMatch[2], 10),  // Extracts course number (e.g., 200)
				course_suffix: courseMatch[3] || '', // Extracts suffix if present (e.g., "T" from "100T")
				title: row.crsetitle.trim(),      // Map to `title`
				hours: parseInt(row.crhrs, 10) || 0, // Map to `hours` (default 0 if null)
				course_fee: parseFloat(row.course_fee) || 0, // Map to `course_fee`, default 0
				web_fee: parseFloat(row.web_fee) || 0,  // Map to `web_fee`, default 0
			};
		}).filter(row => row !== null); // Remove invalid rows

		const columnTypes = {
			subject: 'nvarchar',
			course_number: 'int',
			course_suffix: 'nvarchar',
			title: 'nvarchar',
			hours: 'int',
			course_fee: 'decimal',
			web_fee: 'decimal',
		};

		const result = await importData('courses', ['subject', 'course_number', 'course_suffix'], transformedData, fileName, importedBy, columnTypes);

		res.json({
			message: 'Courses imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error) {
		console.error(`Error importing courses data: ${error.message}`);
		res.status(500).json({ error: 'Error importing courses data.' });
	}
});

export default router;