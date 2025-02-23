import express from 'express';
import { importData } from './helpers';
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

const router = express.Router();

router.post('/student_courses', async (req, res) => {
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
				course_number: parseInt(courseMatch[1], 10),
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
	} catch (error: any) {
		console.error(`Error importing Student Courses data: ${error.message}`);
		res.status(500).json({ error: 'Error importing Student Courses data.' });
	}
});

export default router;