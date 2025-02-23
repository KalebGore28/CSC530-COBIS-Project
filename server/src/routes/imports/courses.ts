import express from 'express';
import { importData } from './helpers';
import { courses } from '../../db/models/courses';

interface CourseRow {
	course: string;
	crsetitle: string;
	crhrs: string;
	course_fee: string;
	web_fee: string;
}

async function importCourses(
	mappedData: CourseRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		courses,
		['subject', 'number', 'suffix'],
		mappedData,
		fileName,
		importedBy
	);
}

const router = express.Router();

router.post('/courses', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Transform the CSV data to match the database schema
		const transformedData = mappedData.map((row: { course: string; crsetitle: string; crhrs: string; course_fee: string; web_fee: string; }) => {

			const courseMatch = row.course.match(/^([A-Za-z]+)(\d+)([A-Za-z]*)$/);

			if (!courseMatch) {
				console.warn(`⚠ Invalid COURSE format: ${row.course}`);
				return null; // Skip invalid rows
			}

			return {
				subject: courseMatch[1],          // Extracts the subject (e.g., "ACC")
				number: parseInt(courseMatch[2], 10),  // Extracts course number (e.g., 200)
				suffix: courseMatch[3] || '', // Extracts suffix if present (e.g., "T" from "100T")
				title: row.crsetitle.trim(),      // Map to `title`
				hours: parseInt(row.crhrs, 10) || 0, // Map to `hours` (default 0 if null)
				fee: parseFloat(row.course_fee) || 0, // Map to `course_fee`, default 0
				web_fee: parseFloat(row.web_fee) || 0,  // Map to `web_fee`, default 0
			};
		}).filter((row: null) => row !== null); // Remove invalid rows

		const result = await importCourses(transformedData, fileName, importedBy);

		res.json({
			message: 'Courses imported successfully.',
			totalRecords: result.totalRecords,
			errors: result.errorDetails
		});
	} catch (error: any) {
		console.error(`Error importing courses data: ${error.message}`);
		res.status(500).json({ error: 'Error importing courses data.' });
	}
});

export default router;