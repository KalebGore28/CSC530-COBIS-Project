import express, { Request, Response } from 'express';
import { getDbConnection } from '../db/connection';
import { students, studentAcademicInfo, studentPrograms, studentCourses } from '../db/schema';
import { eq, and, inArray, gte, lte, exists, notExists, or } from 'drizzle-orm';
import 'zod-openapi/extend';
import { z } from 'zod';

const router = express.Router();

router.get('/student-lookup', async (req: Request, res: Response) => {
	try {
		const db = (await getDbConnection()).orm;

		// Extract and validate query parameters
		const { academicLevels, gpaMin, gpaMax, majors, minors, coursesTaken, coursesNotTaken, gradeFilters } = req.query;

		// Parse query parameters into usable formats
		const academicLevelsArray = typeof academicLevels === 'string' ? academicLevels.split(',') : [];
		const gpaMinNum = typeof gpaMin === 'string' ? parseFloat(gpaMin) : undefined;
		const gpaMaxNum = typeof gpaMax === 'string' ? parseFloat(gpaMax) : undefined;
		const majorsArray = typeof majors === 'string' ? majors.split(',') : [];
		const minorsArray = typeof minors === 'string' ? minors.split(',') : [];
		const coursesTakenArray = typeof coursesTaken === 'string' ? coursesTaken.split(',') : [];
		const coursesNotTakenArray = typeof coursesNotTaken === 'string' ? coursesNotTaken.split(',') : [];
		const gradeFiltersArray = typeof gradeFilters === 'string' ? gradeFilters.split(',') : [];

		// Helper to parse course IDs (assuming format: "SUBJ1234S")
		const parseCourseId = (courseId: string) => {
			const match = courseId.match(/^([A-Z]+)(\d+)([A-Z]*)$/);
			if (!match) throw new Error(`Invalid course ID: ${courseId}`);
			return { subject: match[1], number: match[2], suffix: match[3] || '' };
		};

		const parsedCoursesTaken = coursesTakenArray.map(parseCourseId);
		const parsedCoursesNotTaken = coursesNotTakenArray.map(parseCourseId);
		const parsedGradeFilters = gradeFiltersArray.map(filter => {
			const [courseId, grade] = filter.split(':');
			const { subject, number, suffix } = parseCourseId(courseId);
			return { subject, number, suffix, grade };
		});

		// Initialize base query
		let studentsQuery = db
			.select({
				mnumber: students.mnumber,
				first_name: students.first_name,
				last_name: students.last_name,
			})
			.from(students)
			.innerJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber));

		// Build single whereClause by accumulating conditions
		const conditions = [];

		// Academic level filter with OR condition for multiple levels
		if (academicLevelsArray.length > 0) {
			const levelConditions = academicLevelsArray.map(level => {
				if (level === 'Freshman') {
					return lte(studentAcademicInfo.overall_earned_hours, 29);
				} else if (level === 'Sophomore') {
					return and(gte(studentAcademicInfo.overall_earned_hours, 30), lte(studentAcademicInfo.overall_earned_hours, 59));
				} else if (level === 'Junior') {
					return and(gte(studentAcademicInfo.overall_earned_hours, 60), lte(studentAcademicInfo.overall_earned_hours, 89));
				} else if (level === 'Senior') {
					return gte(studentAcademicInfo.overall_earned_hours, 90);
				}
				return null;
			}).filter(Boolean);

			if (levelConditions.length > 0) {
				conditions.push(or(...levelConditions));
			}
		}

		// GPA range filter
		if (gpaMinNum !== undefined && gpaMaxNum !== undefined) {
			conditions.push(
				and(
					gte(studentAcademicInfo.overall_gpa, gpaMinNum),
					lte(studentAcademicInfo.overall_gpa, gpaMaxNum)
				)
			);
		}

		// Majors filter
		if (majorsArray.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.type, 'MAJOR'),
								inArray(studentPrograms.program, majorsArray)
							)
						)
				)
			);
		}

		// Minors filter
		if (minorsArray.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.type, 'MINOR'),
								inArray(studentPrograms.program, minorsArray)
							)
						)
				)
			);
		}

		// Courses taken filter
		parsedCoursesTaken.forEach(course => {
			conditions.push(
				exists(
					db
						.select()
						.from(studentCourses)
						.where(
							and(
								eq(studentCourses.mnumber, students.mnumber),
								eq(studentCourses.course_subject, course.subject),
								eq(studentCourses.course_number, course.number),
								eq(studentCourses.course_suffix, course.suffix)
							)
						)
				)
			);
		});

		// Courses not taken filter
		parsedCoursesNotTaken.forEach(course => {
			conditions.push(
				notExists(
					db
						.select()
						.from(studentCourses)
						.where(
							and(
								eq(studentCourses.mnumber, students.mnumber),
								eq(studentCourses.course_subject, course.subject),
								eq(studentCourses.course_number, course.number),
								eq(studentCourses.course_suffix, course.suffix)
							)
						)
				)
			);
		});

		// Grade filters
		parsedGradeFilters.forEach(filter => {
			if (filter.grade) {
				conditions.push(
					exists(
						db
							.select()
							.from(studentCourses)
							.where(
								and(
									eq(studentCourses.mnumber, students.mnumber),
									eq(studentCourses.course_subject, filter.subject),
									eq(studentCourses.course_number, filter.number),
									eq(studentCourses.course_suffix, filter.suffix),
									eq(studentCourses.final_grade, filter.grade)
								)
							)
					)
				);
			}
		});

		// Apply the single whereClause
		if (conditions.length > 0) {
			studentsQuery = studentsQuery.where(and(...conditions));
		}

		// Execute query and return results
		const result = await studentsQuery;
		res.json(result);
	} catch (error) {
		console.error('Error in /api/student-lookup:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Preparing OpenAPI spec
const academicLevelParam = z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']).openapi({ description: 'Academic level', example: 'Freshman', ref: 'academic_level' });
const gpaRangeParam = z.string().openapi({ description: 'GPA range (min,max)', example: '2.0,4.0', ref: 'gpa_range' });
const majorsParam = z.string().openapi({ description: 'Majors', example: 'A020', ref: 'majors' });
const minorsParam = z.string().openapi({ description: 'Minors', example: 'B050', ref: 'minors' });
const coursesTakenParam = z.string().openapi({ description: 'Courses taken', example: 'ACC200', ref: 'courses_taken' });
const coursesNotTakenParam = z.string().openapi({ description: 'Courses not taken', example: 'ACC201', ref: 'courses_not_taken' });
const gradeFiltersParam = z.string().openapi({ description: 'Grade filters', example: 'ACC200:A', ref: 'grade_filters' });
export const studentLookupSpec = {
	'/api/student-lookup': {
		get: {
			tags: ['Student Lookup'],
			operationId: 'studentLookup',
			description: 'Lookup students based on academic criteria',
			requestParams: {
				query: z.object({
					academicLevels: academicLevelParam,
					gpaRange: gpaRangeParam,
					majors: majorsParam,
					minors: minorsParam,
					coursesTaken: coursesTakenParam,
					coursesNotTaken: coursesNotTakenParam,
					gradeFilters: gradeFiltersParam,
				}),
			},
			responses: {
				200: {
					description: 'List of students matching the criteria',
					content: {
						'application/json': {
							schema: z.array(z.object({
								mnumber: z.string(),
								first_name: z.string(),
								last_name: z.string(),
							}))
						},
					},
				},
			},
		},
	},
}

export default router;