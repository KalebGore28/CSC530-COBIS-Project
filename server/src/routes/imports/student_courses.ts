import express from 'express';
import { importData } from '../../utils/importData';
import { studentCourses } from '../../db/models/student_courses';

interface StudentCoursesRow {
	mnumber: string;
	term: string;
	partofterm: string;
	crn: string;
	crsesubj: string;
	crsenumb: string;
	section: string;
	crhrs: string;
	levlcode: string;
	rstscode: string;
	insmcode: string;
	lastattend: string;
	midgrade: string;
	fingrade: string;
}

async function importStudentCourses(
	mappedData: StudentCoursesRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentCourses,
		['mnumber', 'term', 'year', 'crn'],
		mappedData,
		fileName,
		importedBy
	);
}

export const studentCoursesRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/student_courses:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import student courses data.
	 *     description: >
	 *       Imports student courses data from a CSV file. The CSV data is transformed to match the database schema:
	 *       - The "term" field is parsed to extract the term (last two digits) and the year (first four digits).
	 *       - The "crsenumb" field is parsed to separate the course number and an optional suffix.
	 *       - Other fields such as part of term, CRN, course subject, section, course hours, course level,
	 *         registration status, instructional method, last attendance, midterm grade, and final grade are mapped accordingly.
	 *       Invalid rows (with an invalid term or course format) are skipped.
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
	 *                     mnumber:
	 *                       type: string
	 *                     term:
	 *                       type: string
	 *                       description: Term in YYYYMM format.
	 *                     partofterm:
	 *                       type: string
	 *                     crn:
	 *                       type: string
	 *                     crsesubj:
	 *                       type: string
	 *                     crsenumb:
	 *                       type: string
	 *                       description: Course number with an optional suffix (e.g., "200T").
	 *                     section:
	 *                       type: string
	 *                     crhrs:
	 *                       type: string
	 *                     levlcode:
	 *                       type: string
	 *                     rstscode:
	 *                       type: string
	 *                     insmcode:
	 *                       type: string
	 *                     lastattend:
	 *                       type: string
	 *                     midgrade:
	 *                       type: string
	 *                     fingrade:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Student courses imported successfully.
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
	 *         description: Error importing student courses data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/student_courses', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;

			// Transform the CSV data to match the database schema
			const transformedData = mappedData.map((row: { term: string; crsenumb: string; mnumber: string; partofterm: string; crn: string; crsesubj: string; section: string; crhrs: string; levlcode: string; rstscode: string; insmcode: string; lastattend: string; midgrade: string; fingrade: string; }) => {
				const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

				if (!termMatch) {
					console.warn(`⚠ Invalid TERM format: ${row.term}`);
					return null; // Skip invalid rows
				}

				// Separate optional course suffix from course number
				const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);

				if (!courseMatch) {
					console.warn(`⚠ Invalid COURSE format: ${row.crsenumb}`);
					return null; // Skip invalid rows
				}

				return {
					mnumber: row.mnumber,
					term: termMatch[2],
					year: parseInt(termMatch[1], 10),
					part_of_term: row.partofterm,
					crn: row.crn,
					course_subject: row.crsesubj,
					course_number: courseMatch[1],
					course_suffix: courseMatch[2] || '',
					course_section: row.section,
					course_hours: parseFloat(row.crhrs) || 0,
					course_level: row.levlcode,
					registration_status: row.rstscode,
					instructional_method: row.insmcode,
					last_attendance: row.lastattend,
					midterm_grade: row.midgrade,
					final_grade: row.fingrade,
				};
			}).filter((row: null) => row !== null); // Remove invalid rows

			const result = await importStudentCourses(transformedData, fileName, importedBy);
			res.json({
				message: 'Student Courses imported successfully.',
				totalRecords: result.totalRecords,
				errors: result.errorDetails
			});
			/* v8 ignore next 4 */
		} catch (error: any) {
			console.error(`Error importing Student Courses data: ${error.message}`);
			res.status(500).json({ error: 'Error importing Student Courses data.' });
		}
	});