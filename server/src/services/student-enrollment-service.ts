// src/services/student-enrollment-service.ts
import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	students,
	studentCourses,
	courses,
	terms,
	instructionalMethods
} from '../db/schema';
import { AuthAndPermissionsRequest } from '../types/requests';
import { AccessService } from './access-service';

export class StudentEnrollmentService {
	/**
	 * Get a student's course enrollment history
	 */
	static async getEnrollmentHistory(
		studentMnumber: string,
		user: AuthAndPermissionsRequest
	) {
		const db = (await getDbConnection()).orm;

		// Get access filters based on user's role
		const accessService = user.accessService || new AccessService();
		const accessFilters = accessService.getStudentCoursesFilters(user, studentMnumber);

		// Base conditions - always filter for the specified student
		const conditions: SQL[] = [eq(studentCourses.mnumber, studentMnumber)];

		// Add access control filters
		if (accessFilters.length > 0) {
			conditions.push(...accessFilters);
		}

		// Query the database
		const enrollmentData = await db
			.select({
				term: terms.description,
				termCode: studentCourses.term,
				year: studentCourses.year,
				courseId: sql`${studentCourses.course_subject} || ${studentCourses.course_number} || ${studentCourses.course_suffix}`,
				courseTitle: courses.title,
				section: studentCourses.course_section,
				creditHours: studentCourses.course_hours,
				grade: studentCourses.final_grade,
				instructionalMethod: instructionalMethods.description,
			})
			.from(studentCourses)
			.leftJoin(
				courses,
				and(
					eq(studentCourses.course_subject, courses.subject),
					eq(studentCourses.course_number, courses.number),
					eq(studentCourses.course_suffix, courses.suffix)
				)
			)
			.leftJoin(terms, eq(studentCourses.term, terms.code))
			.leftJoin(instructionalMethods, eq(studentCourses.instructional_method, instructionalMethods.code))
			.where(and(...conditions))
			.orderBy(desc(studentCourses.year), desc(studentCourses.term));

		// Get student info
		const studentInfo = await db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				lastName: students.last_name,
				email: students.email
			})
			.from(students)
			.where(eq(students.mnumber, studentMnumber))
			.limit(1);

		if (studentInfo.length === 0) {
			return null;
		}

		// Calculate statistics
		const totalCourses = enrollmentData.length;
		const totalCreditHours = enrollmentData.reduce(
			(sum, course) => sum + (course.creditHours || 0),
			0
		);

		// Return formatted response
		return {
			student: {
				mnumber: studentInfo[0].mnumber,
				name: `${studentInfo[0].firstName} ${studentInfo[0].lastName}`,
				email: studentInfo[0].email
			},
			enrollmentHistory: enrollmentData,
			stats: {
				totalCourses,
				totalCreditHours,
				termCount: new Set(enrollmentData.map(course => `${course.termCode}-${course.year}`)).size
			}
		};
	}
}