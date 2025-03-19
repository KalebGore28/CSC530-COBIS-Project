import express from 'express';
import { importData } from '../../utils/importData';
import { studentCourses } from '../../db/models/student_courses';
import 'zod-openapi/extend';
import { z } from 'zod';

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

/**
 * Import student courses data
 * @param mappedData - The student courses data to import
 * @param fileName - The name of the file being imported
 * @param importedBy - The user importing the data
 * @returns `message`, `totalRecords`, and `errors`
 */
const router = express.Router()
router.post('/student-courses', async (req, res) => {
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

// Preparing OpenAPI spec
const mappedData = z.array(z.object({
	mnumber: z.string().openapi({ description: 'The student M number', example: 'M100123456', ref: 'studentCourseMNumber' }),
	term: z.string().openapi({ description: 'The term code', example: '202310', ref: 'studentCourseTerm' }),
	partofterm: z.string().openapi({ description: 'The part of term code', example: '1', ref: 'studentCoursePartOfTerm' }),
	crn: z.string().openapi({ description: 'The course reference number', example: '12345', ref: 'studentCourseReferenceNumber' }),
	crsesubj: z.string().openapi({ description: 'The course subject code', example: 'ACC', ref: 'studentCourseSubjectCode' }),
	crsenumb: z.string().openapi({ description: 'The course number', example: '200', ref: 'studentCourseNumber' }),
	section: z.string().openapi({ description: 'The course section', example: '03', ref: 'studentCourseSection' }),
	crhrs: z.string().openapi({ description: 'The course hours', example: '3.0', ref: 'studentCourseHours' }),
	levlcode: z.string().openapi({ description: 'The course level code', example: 'UG', ref: 'studentCourseLevelCode' }),
	rstscode: z.string().openapi({ description: 'The registration status code', example: 'RE', ref: 'studentCourseRegistrationStatusCode' }),
	insmcode: z.string().openapi({ description: 'The instructional method code', example: 'CLAS', ref: 'studentCourseInstructionalMethodCode' }),
	lastattend: z.string().openapi({ description: 'The last attendance date', example: '2023-02-15', ref: 'studentCourseLastAttendanceDate' }),
	midgrade: z.string().openapi({ description: 'The midterm grade', example: 'B', ref: 'studentCourseMidtermGrade' }),
	fingrade: z.string().openapi({ description: 'The final grade', example: 'A', ref: 'studentCourseFinalGrade' }),
}));
const fileName = z.string().openapi({ description: 'Name of the file being imported', example: 'student-courses.csv', ref: 'studentCoursesFileName' });
const importedBy = z.string().openapi({ description: 'User importing the data', example: 'admin', ref: 'studentCoursesImportedBy' });

export const importStudentCoursesSpec = {
	'/api/import/student-courses': {
		post: {
			tags: ['Imports'],
			operationId: 'importStudentCourses',
			description: 'Import student courses data',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							mappedData,
							fileName,
							importedBy
						})
					}
				}
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								message: z.string(),
								totalRecords: z.number(),
								errors: z.array(z.object({
									row: z.number(),
									error: z.string()
								}))
							})
						}
					}
				}
			}
		}
	}
}

export default router;