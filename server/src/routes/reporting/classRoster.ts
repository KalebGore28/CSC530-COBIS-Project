import express, { Request, Response } from 'express';
import { and, eq, sql } from "drizzle-orm";
import { getDbConnection } from "../../db/connection";
import { hasRole } from '../../middleware/hasRole';
import {
	instructorCourses,
	studentCourses,
	students,
	studentPrograms,
	studentAcademicInfo
} from "../../db/schema";

import 'zod-openapi/extend';
import { z } from 'zod';

/**
 * User Story:
 * As a faculty member, I need access to class rosters for current and previously taught courses.
 * The rosters should include a list of students, their majors, and the grades received. Additionally,
 * the system should allow reporting on class-wide statistics, such as overall class GPA.
 */



const router = express.Router();
// @ts-ignore
router.use(hasRole(['faculty']));
router.get('/class-roster', async (req: Request, res: Response) => {
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

	// instructor couses are found in the instructorCourses table.
	// students can be found by the relationship between instructorCourses and studentCourses,
	// then students can be found by the relationship between studentCourses and students.
	// students majors can be found by the relationship between students and studentPrograms.
	// individual students GPAs can be found by the relationship between students and studentAcademicInfo.

	try {
		const result = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				mnumber: students.mnumber,
				first_name: students.first_name,
				last_name: students.last_name,
				major: studentPrograms.program,
				final_grade: studentCourses.final_grade,
				gpa: studentAcademicInfo.overall_gpa,
			})
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.course_subject, studentCourses.course_subject),
					eq(instructorCourses.course_number, studentCourses.course_number),
					eq(instructorCourses.course_suffix, studentCourses.course_suffix),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.innerJoin(students, eq(studentCourses.mnumber, students.mnumber))
			.innerJoin(studentPrograms, eq(students.mnumber, studentPrograms.mnumber))
			.innerJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber))
			.where(
				and(
					eq(instructorCourses.instructor_mnumber, instructorMNumber as string),
					eq(instructorCourses.term, termCode as string),
					eq(instructorCourses.year, yearInt)
				)
			);

		// Calculate the overall class GPA
		const roster = result;

		// Separate the classes by course subject, number, and suffix, and calculate the overall class GPA
		const classes = roster.reduce((acc: Record<string, { courseSubject: string; courseNumber: string; courseSuffix: string; students: any[]; overallGPA?: number }>, student) => {
			const classKey = `${student.courseSubject}${student.courseNumber}${student.courseSuffix}`;
			if (!acc[classKey]) {
				acc[classKey] = {
					courseSubject: student.courseSubject,
					courseNumber: student.courseNumber,
					courseSuffix: student.courseSuffix,
					students: []
				};
			}
			acc[classKey].students.push({
				mnumber: student.mnumber,
				first_name: student.first_name,
				last_name: student.last_name,
				major: student.major,
				final_grade: student.final_grade,
				gpa: student.gpa,
			});
			return acc;
		}, {});

		// Calculate the overall GPA for each class
		Object.values(classes).forEach(cls => {
			const totalGPA = cls.students.reduce((sum, student) => sum + student.gpa, 0);
			cls.overallGPA = cls.students.length > 0 ? totalGPA / cls.students.length : 0;
		});


		res.json({ classes });
		return;
	} catch (error) {
		console.error("Error fetching class roster:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Preparing OpenAPI spec
const instructorMNumberSpec = z.string().openapi({ description: 'Instructor MNumber', example: '123456789', ref: 'class_roster_instructor_mnumber' });
const termCodeSpec = z.string().openapi({ description: 'Term Code', example: '10', ref: 'class_roster_term_code' });
const yearSpec = z.string().openapi({ description: 'Year', example: '2023', ref: 'class_roster_year' });
export const classRosterSpec = {
	'/api/reporting/class-roster': {
		get: {
			tags: ['Reporting'],
			operationId: 'getClassRoster',
			description: 'Get the class roster for a specific instructor and term',
			requestParams: {
				query: z.object({
					instructorMNumber: instructorMNumberSpec,
					termCode: termCodeSpec,
					year: yearSpec
				}),
			},
			responses: {
				200: {
					description: 'Class roster data',
					content: {
						'application/json': {
							schema: z.array(z.object({
								courseSubject: z.string(),
								courseNumber: z.string(),
								courseSuffix: z.string(),
								mnumber: z.string(),
								first_name: z.string(),
								last_name: z.string(),
								major: z.string(),
								final_grade: z.number().nullable(),
								gpa: z.number().nullable(),
								overall_class_gpa: z.number()
							}))
						}
					},
				},
			},
		},
	},
}

export default router;