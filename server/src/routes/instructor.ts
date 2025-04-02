// src/routes/instructor.ts
import express, { Request, Response } from 'express';
import { eq, and, desc, sql, max, count, avg, sum } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	instructors,
	user,
	instructorCourses,
	studentCourses,
	courses,
	departments,
	colleges
} from '../db/schema';
import 'zod-openapi/extend';
import { z } from 'zod';

const router = express.Router();
router.get('/:mnumber', async (req: Request, res: Response) => {
	const db = (await getDbConnection()).orm;

	try {
		const { mnumber } = req.params;

		// 1. Get basic instructor information
		const instructorInfo = await db
			.select({
				mnumber: instructors.mnumber,
				firstName: instructors.first_name,
				lastName: instructors.last_name,
				department: departments.description,
				college: colleges.description,
				email: user.email,
				image: user.image
			})
			.from(instructors)
			.leftJoin(user, eq(instructors.mnumber, user.mnumber))
			.leftJoin(departments, eq(instructors.department, departments.code))
			.leftJoin(colleges, eq(instructors.college, colleges.code))
			.where(eq(instructors.mnumber, mnumber))
			.limit(1);

		if (instructorInfo.length === 0) {
			res.status(404).json({ error: 'Instructor not found' });
			return;
		}

		const instructor = instructorInfo[0];

		// 2. Find the current term and year
		const currentTermData = await db
			.select({
				maxYear: max(instructorCourses.year),
			})
			.from(instructorCourses);

		const maxYear = currentTermData[0]?.maxYear || new Date().getFullYear();

		const currentTermCodeData = await db
			.select({
				maxTerm: max(instructorCourses.term),
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.year, maxYear));

		const currentTermCode = currentTermCodeData[0]?.maxTerm || '80'; // Default to Fall if not found

		// Map term code to name
		const termNameMap: Record<string, string> = {
			'10': 'SPRING',
			'50': 'SUMMER',
			'80': 'FALL',
			'90': 'WINTER'
		};

		const currentTerm = termNameMap[currentTermCode] || 'UNKNOWN';

		// 3. Check if currently teaching
		const currentCourseCount = await db
			.select({
				count: count()
			})
			.from(instructorCourses)
			.where(
				and(
					eq(instructorCourses.mnumber, mnumber),
					eq(instructorCourses.term, currentTermCode),
					eq(instructorCourses.year, maxYear)
				)
			);

		const isCurrentlyTeaching = currentCourseCount[0]?.count > 0;

		// 4. Calculate teaching summary
		const totalCoursesTaught = await db
			.select({
				count: count()
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.mnumber, mnumber));

		// Get unique courses taught count
		const uniqueCoursesTaught = await db
			.select({
				count: sql`COUNT(DISTINCT ${instructorCourses.course_subject} || ${instructorCourses.course_number} || ${instructorCourses.course_suffix})`
			})
			.from(instructorCourses)
			.where(eq(instructorCourses.mnumber, mnumber));


		// 5. Get most taught courses
		const mostTaughtCoursesRaw = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				count: count(),
			})
			.from(instructorCourses)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix,
				courses.title
			)
			.orderBy(desc(count()))
			.limit(5);

		const mostTaughtCourses = mostTaughtCoursesRaw.map(course => ({
			courseId: `${course.courseSubject}${course.courseNumber}${course.courseSuffix}`,
			courseTitle: course.courseTitle || 'Unknown',
			timesTaught: course.count
		}));

		// 6. Get student metrics
		// We need to join instructorCourses and studentCourses on crn, term, and year
		const studentMetrics = await db
			.select({
				totalStudents: count(studentCourses.mnumber),
				totalCreditHours: sum(studentCourses.course_hours)
			})
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber));

		// Calculate average class size separately
		const classesWithSizes = await db
			.select({
				crn: instructorCourses.crn,
				term: instructorCourses.term,
				year: instructorCourses.year,
				studentCount: count(studentCourses.mnumber)
			})
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(instructorCourses.crn, instructorCourses.term, instructorCourses.year);

		// Calculate average class size
		const avgClassSize = classesWithSizes.length > 0
			? classesWithSizes.reduce((sum, cls) => sum + cls.studentCount, 0) / classesWithSizes.length
			: 0;

		// 7. Get course details with student counts
		const courseDetailsQuery = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				courseTitle: courses.title,
				crn: instructorCourses.crn,
				creditHours: studentCourses.course_hours,
				studentCount: count(studentCourses.mnumber),
			})
			.from(instructorCourses)
			.leftJoin(
				courses,
				and(
					eq(instructorCourses.course_subject, courses.subject),
					eq(instructorCourses.course_number, courses.number),
					eq(instructorCourses.course_suffix, courses.suffix)
				)
			)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(
				instructorCourses.term,
				instructorCourses.year,
				instructorCourses.course_subject,
				instructorCourses.course_number,
				instructorCourses.course_suffix,
				courses.title,
				instructorCourses.crn,
			)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		const courseDetails = courseDetailsQuery.map(course => {
			const termName = termNameMap[course.term] || 'UNKNOWN';
			return {
				term: termName,
				termCode: course.term,
				year: course.year,
				courseId: `${course.courseSubject}${course.courseNumber}${course.courseSuffix}`,
				courseTitle: course.courseTitle || 'Unknown',
				courseSubject: course.courseSubject,
				courseNumber: course.courseNumber,
				courseSuffix: course.courseSuffix,
				crn: course.crn,
				creditHours: course.creditHours || 0,
				studentCount: course.studentCount || 0,
				totalCreditHours: (course.creditHours || 0) * (course.studentCount || 0)
			};
		});

		// 8. Generate term summaries
		const termSummariesRaw = await db
			.select({
				term: instructorCourses.term,
				year: instructorCourses.year,
				courseCount: sql`COUNT(DISTINCT ${instructorCourses.crn})`,
				studentCount: count(studentCourses.mnumber),
				creditHoursDelivered: sum(studentCourses.course_hours)
			})
			.from(instructorCourses)
			.leftJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(eq(instructorCourses.mnumber, mnumber))
			.groupBy(instructorCourses.term, instructorCourses.year)
			.orderBy(desc(instructorCourses.year), desc(instructorCourses.term));

		const termSummaries = termSummariesRaw.map(term => ({
			term: termNameMap[term.term] || 'UNKNOWN',
			termCode: term.term,
			year: term.year,
			courseCount: term.courseCount,
			studentCount: term.studentCount || 0,
			creditHoursDelivered: Number(term.creditHoursDelivered || 0)
		}));


		// 9. Assemble the final response
		const response = {
			instructor: {
				mnumber: instructor.mnumber,
				name: `${instructor.firstName} ${instructor.lastName}`,
				firstName: instructor.firstName,
				lastName: instructor.lastName,
				department: instructor.department,
				college: instructor.college,
				email: instructor.email,
				image: instructor.image
			},
			currentStatus: {
				currentTerm: `${currentTerm} ${maxYear}`,
				currentTermCode,
				currentYear: maxYear,
				isCurrentlyTeaching,
				currentCourseCount: currentCourseCount[0]?.count || 0
			},
			teachingSummary: {
				totalCoursesTaught: totalCoursesTaught[0]?.count || 0,
				uniqueCoursesTaught: uniqueCoursesTaught[0]?.count || 0,
				totalStudentsTaught: studentMetrics[0]?.totalStudents || 0,
				totalCreditHoursDelivered: Number(studentMetrics[0]?.totalCreditHours || 0),
				averageClassSize: Math.round(avgClassSize * 10) / 10,
				mostTaughtCourses
			},
			courseDetails,
			termSummaries
		};

		res.json(response);
		return;
	} catch (error) {
		console.error('Error fetching instructor data:', error);
		res.status(500).json({ error: 'Internal server error' });
		return
	}
});

// OpenAPI Specification
export const instructorRouterSpec = {
	'/api/instructor/{mnumber}': {
		get: {
			tags: ['Instructor'],
			operationId: 'getInstructor',
			description: 'Get instructor information and teaching summary',
			responses: {
				'200': {
					description: '200 OK',
					content: {
						'application/json': {
							schema: z.object({
								instructor: z.object({
									mnumber: z.string(),
									name: z.string(),
									firstName: z.string(),
									lastName: z.string(),
									department: z.string(),
									college: z.string(),
									email: z.string().optional(),
									image: z.string().optional()
								}),
								currentStatus: z.object({
									currentTerm: z.string(),
									currentTermCode: z.string(),
									currentYear: z.number(),
									isCurrentlyTeaching: z.boolean(),
									currentCourseCount: z.number()
								}),
								teachingSummary: z.object({
									totalCoursesTaught: z.number(),
									uniqueCoursesTaught: z.number(),
									totalStudentsTaught: z.number(),
									totalCreditHoursDelivered: z.number(),
									averageClassSize: z.number(),
									mostTaughtCourses: z.array(z.object({
										courseId: z.string(),
										courseTitle: z.string().optional(),
										timesTaught: z.number()
									}))
								}),
								courseDetails: z.array(z.object({
									term: z.string(),
									termCode: z.string(),
									year: z.number(),
									courseId: z.string(),
									courseTitle: z.string().optional(),
									courseSubject: z.string(),
									courseNumber: z.string(),
									courseSuffix: z.string().optional(),
									crn: z.number().optional(),
									creditHours: z.number().optional(),
									studentCount: z.number().optional()
								})),
								termSummaries: z.array(z.object({
									termCode: z.string(),
									termName: z.string().optional(),
									year: z.number().optional(),
									courseCount: z.number().optional(),
									studentCount: z.number().optional()
								}))
							})
						}
					}
				}

			},
		}
	}
}

export default router;