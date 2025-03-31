import express, { Request, Response } from 'express';
import { and, eq, sql } from "drizzle-orm";
import { getDbConnection } from "../../db/connection";
import {
	instructorCourses,
	studentCourses,
} from "../../db/schema";

import 'zod-openapi/extend';
import { z } from 'zod';


const router = express.Router();

router.get('/total-credit-hours', async (req: Request, res: Response) => {
	const dbConnectionInstance = await getDbConnection();
	const db = dbConnectionInstance.orm;
	const { instructorMNumber, termCode, year } = req.query;

	// Validate query parameters
	if (!instructorMNumber || !termCode || !year) {
		res.status(400).json({ error: "instructorMNumber, termCode, and year are required." });
		return;
	}

	// Convert year from string to number
	const yearInt = parseInt(year as string, 10);
	if (isNaN(yearInt)) {
		res.status(400).json({ error: "Year must be a valid integer." });
		return;
	}

	try {
		// Query to get per-course details
		const result = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseHours: sql<number>`MAX(${studentCourses.course_hours})`, // Use MAX to get a single value
				totalStudents: sql<number>`COUNT(DISTINCT ${studentCourses.mnumber})`
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
					eq(instructorCourses.instructor_mnumber, instructorMNumber as string),
					eq(instructorCourses.term, termCode as string),
					eq(instructorCourses.year, yearInt)
				)
			)
			.groupBy(
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix
			);

		// Calculate the course-specific credit hours and overall total
		const courses = result.map(course => ({
			...course,
			// Calculate correct totalCreditHours as courseHours * totalStudents
			totalCreditHours: (course.courseHours || 0) * course.totalStudents
		}));

		const totalCreditHours = courses.reduce((sum, course) => sum + Number(course.totalCreditHours), 0);

		// Return the response with course list and total
		res.json({
			courses,
			totalCreditHours
		});
		return;
	} catch (error) {
		console.error("Error fetching credit hours:", error);
		res.status(500).json({ error: "Internal server error" });
		return;
	}
});

// Preparing OpenAPI spec
const instructorMNumberParam = z.string().openapi({ description: 'The instructor MNumber', example: 'M12345678', ref: 'instructor_mnumber' });
const termCode = z.string().openapi({ description: 'The term code', example: '10', ref: 'term_code' });
const year = z.string().openapi({ description: 'The year', example: '2023', ref: 'year' });
export const creditHoursSpec = {
	'/api/reporting/total-credit-hours': {
		get: {
			tags: ['Reporting'],
			operationId: 'getCreditHours',
			description: 'Get credit hours for an instructor',
			requestParams: {
				query: z.object({
					instructorMNumber: instructorMNumberParam,
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

export default router;