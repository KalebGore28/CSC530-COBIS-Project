import express, { Request, Response } from 'express';
import { and, eq, notExists, sql } from "drizzle-orm";
import { getDbConnection } from "../../db/connection";
import {
	studentCourses,
	students,
	studentPrograms
} from "../../db/schema";
import { hasRole } from '../../middleware/has-role';

import 'zod-openapi/extend';
import { z } from 'zod';


const router = express.Router();

// @ts-ignore
router.use(hasRole(['department_chair', 'program_coordinator']));
router.get('/student-course-requirement', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameters
	const { programCode, term, year, courseSubject, courseNumber, courseSuffix = "" }: any = req.query;


	// Validate inputs
	if (!programCode || !courseSubject || !courseNumber) {
		res.status(400).json({
			error: "Missing required parameters: programCode, courseSubject, courseNumber"
		});
		return;
	}

	try {
		// Main query: Count students in the program who haven’t completed the course
		const result = await db
			.select({
				mnumber: students.mnumber,
				first_name: students.first_name,
				last_name: students.last_name
			})
			.from(studentPrograms)
			.innerJoin(students, eq(studentPrograms.mnumber, students.mnumber))
			.where(
				and(
					eq(studentPrograms.program, programCode),
					notExists(
						db.select({ mnumber: studentCourses.mnumber })
							.from(studentCourses)
							.where(
								and(
									eq(studentCourses.course_subject, courseSubject),
									eq(studentCourses.course_number, courseNumber),
									eq(studentCourses.course_suffix, courseSuffix),
									sql`${studentCourses.final_grade} >= 2.0`, // TODO: Check if this is the correct way to check for passing grade
									eq(studentCourses.mnumber, studentPrograms.mnumber)
								)
							)
					)
				)
			);

		// Return the response with student list
		res.json({
			numberOfStudents: result.length,
			students: result
		});
		return;
	} catch (error) {
		console.error("Error fetching student course requirement:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const programCodeSpec = z.string().openapi({ description: 'The program code', example: 'A020', ref: 'course_requirement_program_code' });
const courseSubjectSpec = z.string().openapi({ description: 'The course subject', example: 'ACC', ref: 'course_requirement_course_subject' });
const courseNumberSpec = z.string().openapi({ description: 'The course number', example: '201', ref: 'course_requirement_course_number' });
const courseSuffixSpec = z.optional(z.string()).openapi({ description: 'The course suffix', example: '', ref: 'course_requirement_course_suffix' });
export const studentCourseRequirementSpec = {
	'/api/reporting/student-course-requirement': {
		get: {
			tags: ['Reporting'],
			operationId: 'getStudentCourseRequirement',
			description: 'Get the number of students in a program who haven’t completed a course',
			requestParams: {
				query: z.object({
					programCode: programCodeSpec,
					courseSubject: courseSubjectSpec,
					courseNumber: courseNumberSpec,
					courseSuffix: courseSuffixSpec,
				}),
			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								numberOfStudents: z.number(),
							}),
						},
					},
				},
			},
		},
	},
}

export default router;