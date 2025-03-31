import express, { Request, Response } from 'express';
import { importData } from '../../utils/importData';
import { courses } from '../../db/models/courses';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import courses data
 * @param mappedData - The courses data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/course-catalog', async (req: Request, res: Response) => {
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
				number: courseMatch[2],  // Extracts course number (e.g., 200)
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
		/* v8 ignore next 4 */
	} catch (error: any) {
		console.error(`Error importing courses data: ${error.message}`);
		res.status(500).json({ error: 'Error importing courses data.' });
	}
});

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	course: z.string().openapi({ description: 'Unique course identifier with optional suffix. (e.g. T)', example: 'ACC200', ref: 'courses_code' }),
	crsetitle: z.string().openapi({ description: 'Course title', example: 'Principles of Financial Acct', ref: 'courses_title' }),
	crhrs: z.string().openapi({ description: 'Credit hours', example: '3', ref: 'courses_hours' }),
	course_fee: z.string().openapi({ description: 'Course fee', example: '100.00', ref: 'courses_fee' }),
	web_fee: z.string().openapi({ description: 'Web fee', example: '50.00', ref: 'courses_web_fee' }),
})).openapi({ description: 'The course data to import', ref: 'courses_mapped_data' });
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'courses.csv', ref: 'courses_filename' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'courses_imported_by' });

export const importCoursesSpec = {
	'/api/import/course-catalog': {
		post: {
			tags: ['Imports'],
			operationId: 'import_courses',
			description: 'Import courses data',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mappedData,
							fileName,
							importedBy,
						}),
					},
				},
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string(),
								totalRecords: z.number(),
								errors: z.array(z.string()),
							}),
						},
					},
				},
			},
		},
	},
};

export default router;