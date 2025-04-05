import { and, eq, notExists, sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import {
	studentCourses,
	students,
	studentPrograms
} from "../db/schema";

/**
 * Service class for handling reporting-related data operations
 */
export class ReportingService {
	/**
	 * Get the list of students in a program who haven't completed a specific course
	 * 
	 * @param programCode The program code to filter students by
	 * @param courseSubject The subject code of the course
	 * @param courseNumber The number of the course
	 * @param courseSuffix Optional course suffix
	 * @returns List of students and count of students who need the course
	 */
	static async getStudentCourseRequirement(
		programCode: string,
		courseSubject: string,
		courseNumber: string,
		courseSuffix: string = ""
	) {
		const dbConnectionInstance = await getDbConnection();
		const db = dbConnectionInstance.orm;

		// Main query: Count students in the program who haven't completed the course
		const result = await db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				lastName: students.last_name
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
									sql`${studentCourses.final_grade} >= 2.0`, // Check for passing grade
									eq(studentCourses.mnumber, studentPrograms.mnumber)
								)
							)
					)
				)
			);

		return {
			numberOfStudents: result.length,
			students: result
		};
	}
} 