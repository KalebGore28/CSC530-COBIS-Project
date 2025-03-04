import express from 'express';
import { importData } from '../../utils/importData';
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

export const coursesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/courses:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import courses data.
	 *     description: >
	 *       Imports course data from a CSV file. The course field is parsed into subject, number, and suffix.
	 *       Invalid rows are skipped. Other course details such as title, hours, fee, and web_fee are mapped accordingly.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               mappedData:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     course:
	 *                       type: string
	 *                       description: The full course string (e.g., "ACC200T").
	 *                     crsetitle:
	 *                       type: string
	 *                       description: The course title.
	 *                     crhrs:
	 *                       type: string
	 *                       description: The course hours.
	 *                     course_fee:
	 *                       type: string
	 *                       description: The course fee.
	 *                     web_fee:
	 *                       type: string
	 *                       description: The web fee.
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Courses imported successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                 totalRecords:
	 *                   type: integer
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       row:
	 *                         type: object
	 *                       error:
	 *                         type: string
	 *       500:
	 *         description: Error importing courses data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/courses', async (req, res) => {
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