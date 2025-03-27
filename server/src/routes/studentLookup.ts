import express, { Request, Response } from 'express';
import { getDbConnection } from '../db/connection';
import { students, studentAcademicInfo, studentPrograms } from '../db/schema'; // Import your table schemas
import { eq, and, inArray, gte, lte, exists } from 'drizzle-orm';
import 'zod-openapi/extend';
import { z } from 'zod';

const router = express.Router();

router.get('/student-lookup', async (req: Request, res: Response) => {
	try {
		const db = (await getDbConnection()).orm;

		// Extract query parameters
		const { term, academicLevels, gpaMin, gpaMax, majors, minors } = req.query;

		// Validate required term parameter
		if (!term || typeof term !== 'string') {
			res.status(400).json({ error: 'Term is required and must be a string' });
			return;
		}

		// Parse parameters with defaults
		const academicLevelsArray = academicLevels && typeof academicLevels === 'string'
			? academicLevels.split(',')
			: [];
		const gpaMinNum = gpaMin && typeof gpaMin === 'string' ? parseFloat(gpaMin) : undefined;
		const gpaMaxNum = gpaMax && typeof gpaMax === 'string' ? parseFloat(gpaMax) : undefined;
		const majorsArray = majors && typeof majors === 'string' ? majors.split(',') : [];
		const minorsArray = minors && typeof minors === 'string' ? minors.split(',') : [];

		// Build dynamic conditions array
		const conditions = [];

		// Filter by academic level if provided
		if (academicLevelsArray.length > 0) {
			conditions.push(inArray(studentAcademicInfo.academic_standing, academicLevelsArray));
		}

		// Filter by GPA range if both min and max are provided
		if (gpaMinNum !== undefined && gpaMaxNum !== undefined) {
			conditions.push(gte(studentAcademicInfo.overall_gpa, gpaMinNum));
			conditions.push(lte(studentAcademicInfo.overall_gpa, gpaMaxNum));
		}

		// Filter by majors if provided
		if (majorsArray.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.term, term),
								eq(studentPrograms.type, 'MAJOR'),
								inArray(studentPrograms.program, majorsArray)
							)
						)
				)
			);
		}

		// Filter by minors if provided
		if (minorsArray.length > 0) {
			conditions.push(
				exists(
					db
						.select()
						.from(studentPrograms)
						.where(
							and(
								eq(studentPrograms.mnumber, students.mnumber),
								eq(studentPrograms.term, term),
								eq(studentPrograms.type, 'MINOR'),
								inArray(studentPrograms.program, minorsArray)
							)
						)
				)
			);
		}

		// Construct and execute the query
		const studentsQuery = db
			.select({
				mnumber: students.mnumber,
				first_name: students.first_name,
				last_name: students.last_name,
			})
			.from(students)
			.innerJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber))
			.where(and(...conditions));

		const result = await studentsQuery;

		// Return the result as JSON
		res.json(result);
	} catch (error) {
		console.error('Error in /api/student-lookup:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Preparing OpenAPI spec
const termParam = z.string().openapi({ description: 'The term to filter students by', example: '202210', ref: 'student_lookup_term' });
const academicLevelsParam = z.string().optional().openapi({ description: 'Comma-separated list of academic levels to filter students by', example: 'FR,SO', ref: 'student_lookup_academic_levels' });
const gpaMinParam = z.string().optional().openapi({ description: 'Minimum overall GPA to filter students by', example: '2.0', ref: 'student_lookup_gpa_min' });
const gpaMaxParam = z.string().optional().openapi({ description: 'Maximum overall GPA to filter students by', example: '4.0', ref: 'student_lookup_gpa_max' });
const majorsParam = z.string().optional().openapi({ description: 'Comma-separated list of majors to filter students by', example: 'CS,ENG', ref: 'student_lookup_majors' });
const minorsParam = z.string().optional().openapi({ description: 'Comma-separated list of minors to filter students by', example: 'MATH,PHYS', ref: 'student_lookup_minors' });
export const studentLookupSpec = {
	'/api/student-lookup': {
		get: {
			tags: ['Student Lookup'],
			operationId: 'getStudentLookup',
			description: 'Get a list of students based on various filters',
			requestParams: {
				query: z.object({
					term: termParam,
					academicLevels: academicLevelsParam,
					gpaMin: gpaMinParam,
					gpaMax: gpaMaxParam,
					majors: majorsParam,
					minors: minorsParam,
				}),
			},
			responses: {
				'200': {
					description: 'Success',
					content: {
						'application/json': {
							schema: z.array(
								z.object({
									mnumber: z.string(),
									first_name: z.string(),
									last_name: z.string(),
								})
							),
						},
					},
				},
			},
		},
	},
};



export default router;