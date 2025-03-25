import express, { Request, Response, NextFunction } from 'express';
import { and, eq, notExists, sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import { instructorCourses } from "../db/models/instructor_courses";
import { studentCourses } from "../db/models/student_courses";
import { students } from "../db/models/students";
import { studentPrograms } from "../db/models/student_programs";

import 'zod-openapi/extend';
import { z } from 'zod';


const router = express.Router();

router.get('/credit-hours', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;
	const { instructorId, termCode, year } = req.query;

	// Validate query parameters
	if (!instructorId || !termCode || !year) {
		res.status(400).json({ error: "instructorId, termCode, and year are required." });
		return;
	}

	// Convert year from string to number
	const yearInt = parseInt(year as string, 10);
	if (isNaN(yearInt)) {
		res.status(400).json({ error: "Year must be a valid integer." });
		return;
	}

	try {
		// Query to get per-course details and credit hours generated
		const result = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				totalCreditHours: sql<number>`COALESCE(SUM(${studentCourses.course_hours}), 0)`
			})
			.from(instructorCourses)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.course_subject, studentCourses.course_subject),
					eq(instructorCourses.course_number, studentCourses.course_number),
					eq(instructorCourses.course_suffix, studentCourses.course_suffix),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(
				and(
					eq(instructorCourses.user_id, instructorId as string),
					eq(instructorCourses.term, termCode as string),
					eq(instructorCourses.year, yearInt)
				)
			)
			.groupBy(
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix
			);

		// Calculate the overall total credit hours
		const courses = result;
		const totalCreditHours = courses.reduce((acc, course) => acc + course.totalCreditHours, 0);

		// Return the response with course list and total
		res.json({ courses, totalCreditHours });
		return;
	} catch (error) {
		console.error("Error fetching credit hours:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const instructorId = z.string().openapi({ description: 'The instructor ID', example: '1234', ref: 'instructor_id' });
const termCode = z.string().openapi({ description: 'The term code', example: '10', ref: 'term_code' });
const year = z.string().openapi({ description: 'The year', example: '2023', ref: 'year' });
const creditHoursSpec = {
	'/api/reporting/credit-hours': {
		get: {
			tags: ['Reporting'],
			operationId: 'getCreditHours',
			description: 'Get credit hours for an instructor',
			requestParams: {
				query: z.object({
					instructorId,
					termCode,
					year,
				}),

			},
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								courses: z.array(z.object({
									courseSubject: z.string(),
									courseNumber: z.string(),
									courseSuffix: z.string(),
									totalCreditHours: z.number(),
								})),
								totalCreditHours: z.number(),
							}),
						},
					},
				},
			},
		},
	},
}

router.get('/student-course-requirement', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;

	// Extract query parameters
	const { programCode, term, year, courseSubject, courseNumber, courseSuffix }: any = req.query;

	// Validate inputs
	if (!programCode || !term || !year || !courseSubject || !courseNumber || !courseSuffix) {
		res.status(400).json({
			error: "Missing required parameters: programCode, term, year, courseSubject, courseNumber, courseSuffix"
		});
		return;
	}

	const yearInt = parseInt(year, 10);
	if (isNaN(yearInt)) {
		res.status(400).json({ error: "Year must be a valid integer" });
		return;
	}

	try {
		// Main query: Count students in the program who haven’t completed the course
		const result = await db
			.select({
				numberOfStudents: sql`COUNT(*)`.mapWith(Number) // Ensure count is a number
			})
			.from(studentPrograms)
			.innerJoin(students, eq(studentPrograms.mnumber, students.mnumber))
			.where(
				and(
					eq(studentPrograms.program, programCode),
					eq(studentPrograms.term, term),
					eq(studentPrograms.year, yearInt),
					notExists(
						db.select({ mnumber: studentCourses.mnumber })
							.from(studentCourses)
							.where(
								and(
									eq(studentCourses.course_subject, courseSubject),
									eq(studentCourses.course_number, courseNumber),
									eq(studentCourses.course_suffix, courseSuffix),
									sql`${studentCourses.final_grade} >= 2.0`,
									eq(studentCourses.mnumber, studentPrograms.mnumber)
								)
							)
					)
				)
			);

		// Return the count
		res.json({
			numberOfStudents: result[0]?.numberOfStudents || 0
		});
		return;
	} catch (error) {
		console.error("Error fetching student course requirement:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

export const reportingSpecs = {
	...creditHoursSpec,
}

export default router;