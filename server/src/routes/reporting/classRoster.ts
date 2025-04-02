import express, { Request, Response } from 'express';
import { and, eq, sql } from "drizzle-orm";
import { getDbConnection } from "../../db/connection";
import { hasRole } from '../../middleware/hasRole';
import {
	instructorCourses,
	studentCourses,
	students,
	studentPrograms,
	studentAcademicInfo,
	programs,
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

	try {
		// First, get all the course information and student basic data
		const courseStudents = await db
			.select({
				courseSubject: instructorCourses.course_subject,
				courseNumber: instructorCourses.course_number,
				courseSuffix: instructorCourses.course_suffix,
				mnumber: students.mnumber,
				first_name: students.first_name,
				last_name: students.last_name,
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
			.innerJoin(studentAcademicInfo, eq(students.mnumber, studentAcademicInfo.mnumber))
			.where(
				and(
					eq(instructorCourses.mnumber, instructorMNumber as string),
					eq(instructorCourses.term, termCode as string),
					eq(instructorCourses.year, yearInt)
				)
			);

		// Create a map to store unique students and their details
		const studentMap = new Map();
		courseStudents.forEach(student => {
			const key = `${student.courseSubject}${student.courseNumber}${student.courseSuffix}-${student.mnumber}`;
			studentMap.set(key, {
				courseSubject: student.courseSubject,
				courseNumber: student.courseNumber,
				courseSuffix: student.courseSuffix,
				mnumber: student.mnumber,
				first_name: student.first_name,
				last_name: student.last_name,
				final_grade: student.final_grade,
				gpa: student.gpa,
				majors: [] // Will be populated with majors
			});
		});

		// Get all student majors
		const studentMnumbers = courseStudents.map(student => student.mnumber);
		const studentMajors = await db
			.select({
				mnumber: studentPrograms.mnumber,
				program_name: programs.description,
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(sql`${studentPrograms.mnumber} IN ${studentMnumbers}`);

		// Add majors to the student data
		studentMajors.forEach(majorData => {
			courseStudents.forEach(student => {
				if (student.mnumber === majorData.mnumber) {
					const key = `${student.courseSubject}${student.courseNumber}${student.courseSuffix}-${student.mnumber}`;
					const studentData = studentMap.get(key);
					if (studentData && !studentData.majors.includes(majorData.program_name)) {
						studentData.majors.push(majorData.program_name);
					}
				}
			});
		});

		// Group students by class
		const classMap: Record<string, any> = {};
		studentMap.forEach(student => {
			const classKey = `${student.courseSubject}${student.courseNumber}${student.courseSuffix}`;
			if (!classMap[classKey]) {
				classMap[classKey] = {
					courseSubject: student.courseSubject,
					courseNumber: student.courseNumber,
					courseSuffix: student.courseSuffix,
					students: [],
					overallGPA: 0
				};
			}

			classMap[classKey].students.push({
				mnumber: student.mnumber,
				first_name: student.first_name,
				last_name: student.last_name,
				majors: student.majors, // Now includes all majors as an array
				final_grade: student.final_grade,
				gpa: student.gpa
			});
		});

		// Calculate the overall GPA for each class
		Object.values(classMap).forEach((cls: any) => {
			const totalGPA = cls.students.reduce((sum: number, student: any) => sum + (student.gpa || 0), 0);
			cls.overallGPA = cls.students.length > 0 ? parseFloat((totalGPA / cls.students.length).toFixed(2)) : 0;
		});

		res.json({ classes: Object.values(classMap) });
	} catch (error) {
		console.error("Error fetching class roster:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Preparing OpenAPI spec
const instructorMNumberSpec = z.string().openapi({ description: 'Instructor MNumber', example: 'M12345678', ref: 'class_roster_instructor_mnumber' });
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
							schema: z.object({
								classes: z.array(z.object({
									courseSubject: z.string(),
									courseNumber: z.string(),
									courseSuffix: z.string(),
									students: z.array(z.object({
										mnumber: z.string(),
										first_name: z.string(),
										last_name: z.string(),
										majors: z.array(z.string()), // Now an array of majors
										final_grade: z.number().nullable(),
										gpa: z.number().nullable()
									})),
									overallGPA: z.number()
								}))
							})
						}
					},
				},
				400: {
					description: 'Bad request - missing parameters',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				},
				500: {
					description: 'Internal server error',
					content: {
						'application/json': {
							schema: z.object({
								error: z.string()
							})
						}
					}
				}
			},
		},
	},
}

export default router;