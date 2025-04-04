import { SQL, and, eq, inArray, sql, count, exists } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	instructorCourses,
	studentCourses,
	studentPrograms,
	programs,
	studentAdvisors // Added for advisor checks
} from '../db/schema';
import { AuthAndPermissionsRequest } from '../types/requests';

export class AccessService {
	/**
	 * Determines if a user can access a specific student's data
	 */
	async canAccessStudent(
		user: AuthAndPermissionsRequest,
		studentMnumber?: string
	): Promise<boolean> {
		// If no student specified, this will be handled by filters
		if (!studentMnumber) return true;

		// System admins can access all students
		if (user.roles.some(r => r.role_name === 'cobis_administrator')) {
			return true;
		}

		// Users can access their own data
		if (user.mnumber === studentMnumber) {
			return true;
		}

		// Department chairs can access students in their department's programs
		if (user.roles.some(r => r.role_name === 'department_chair') && user.department) {
			const isInDepartment = await this.isStudentInDepartment(studentMnumber, user.department);
			if (isInDepartment) return true;
		}

		// Faculty can access students they've taught
		if (user.roles.some(r => r.role_name === 'faculty') && user.mnumber) {
			const hasTaught = await this.hasInstructorTaughtStudent(user.mnumber, studentMnumber);
			if (hasTaught) return true;
		}

		// Advisors can access students they advise
		if (user.roles.some(r => r.role_name === 'advisor') && user.mnumber) {
			const isAdvisee = await this.isStudentAdvisee(user.mnumber, studentMnumber);
			if (isAdvisee) return true;
		}

		// Administrators can access students in their college's programs
		if (user.roles.some(r => r.role_name === 'administrator') && user.college) {
			const isInCollege = await this.isStudentInCollege(studentMnumber, user.college);
			if (isInCollege) return true;
		}

		return false;
	}

	/**
	 * Returns SQL filters for student course queries based on user's role
	 */
	getStudentCoursesFilters(user: AuthAndPermissionsRequest, studentMnumber: string): SQL[] {
		const filters: SQL[] = [];

		// System admins and self-access have no restrictions
		if (user.roles.some(r => r.role_name === 'cobis_administrator') ||
			user.mnumber === studentMnumber) {
			return filters;
		}

		// Faculty temporal access restriction
		if (user.roles.some(r => r.role_name === 'faculty') && user.mnumber) {
			// Faculty can only see courses up to the last term they taught the student
			filters.push(sql`
				(student_courses.year < (
					SELECT MAX(ic2.year) 
					FROM instructor_courses ic2 
					JOIN student_courses sc2 ON 
						ic2.crn = sc2.crn AND 
						ic2.term = sc2.term AND 
						ic2.year = sc2.year
					WHERE 
						ic2.mnumber = ${user.mnumber} AND 
						sc2.mnumber = ${studentMnumber}
				)
				OR 
				(student_courses.year = (
					SELECT MAX(ic3.year) 
					FROM instructor_courses ic3 
					JOIN student_courses sc3 ON 
						ic3.crn = sc3.crn AND 
						ic3.term = sc3.term AND 
						ic3.year = sc3.year
					WHERE 
						ic3.mnumber = ${user.mnumber} AND 
						sc3.mnumber = ${studentMnumber}
				) AND
				student_courses.term <= (
					SELECT MAX(ic4.term) 
					FROM instructor_courses ic4 
					JOIN student_courses sc4 ON 
						ic4.crn = sc4.crn AND 
						ic4.term = sc4.term AND 
						ic4.year = sc4.year
					WHERE 
						ic4.mnumber = ${user.mnumber} AND 
						sc4.mnumber = ${studentMnumber} AND
						ic4.year = student_courses.year
				)))
			`);
		}

		// Advisor temporal access restriction
		// Similar to faculty, advisors can only see courses up to the most recent term 
		// where they were the student's advisor
		if (user.roles.some(r => r.role_name === 'advisor') && user.mnumber) {
			filters.push(sql`
				(student_courses.year < (
					SELECT MAX(sa.year) 
					FROM student_advisors sa
					WHERE 
						sa.advisor_mnumber = ${user.mnumber} AND 
						sa.student_mnumber = ${studentMnumber}
				)
				OR 
				(student_courses.year = (
					SELECT MAX(sa.year) 
					FROM student_advisors sa
					WHERE 
						sa.advisor_mnumber = ${user.mnumber} AND 
						sa.student_mnumber = ${studentMnumber}
				) AND
				student_courses.term <= (
					SELECT MAX(sa.term) 
					FROM student_advisors sa
					WHERE 
						sa.advisor_mnumber = ${user.mnumber} AND 
						sa.student_mnumber = ${studentMnumber} AND
						sa.year = student_courses.year
				)))
			`);
		}

		return filters;
	}

	// Helper methods with corrected join approach
	private async isStudentInDepartment(studentMnumber: string, departmentCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Check if the student has any program in this department by joining to programs
		const result = await db
			.select({ count: count() })
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					eq(studentPrograms.mnumber, studentMnumber),
					eq(programs.department, departmentCode)
				)
			);

		return result[0]?.count > 0;
	}

	private async isStudentInCollege(studentMnumber: string, collegeCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Check if the student has any program in this college by joining to programs
		const result = await db
			.select({ count: count() })
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					eq(studentPrograms.mnumber, studentMnumber),
					eq(programs.college, collegeCode)
				)
			);

		return result[0]?.count > 0;
	}

	private async hasInstructorTaughtStudent(instructorMnumber: string, studentMnumber: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Check if the instructor has taught this student in any course
		const result = await db
			.select({ count: count() })
			.from(instructorCourses)
			.innerJoin(
				studentCourses,
				and(
					eq(instructorCourses.crn, studentCourses.crn),
					eq(instructorCourses.term, studentCourses.term),
					eq(instructorCourses.year, studentCourses.year)
				)
			)
			.where(
				and(
					eq(instructorCourses.mnumber, instructorMnumber),
					eq(studentCourses.mnumber, studentMnumber)
				)
			);

		return result[0]?.count > 0;
	}

	/**
	 * Check if a student is advised by a specific advisor
	 */
	private async isStudentAdvisee(advisorMnumber: string, studentMnumber: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Check if there's an advising relationship 
		const result = await db
			.select({ count: count() })
			.from(studentAdvisors)
			.where(
				and(
					eq(studentAdvisors.advisor_mnumber, advisorMnumber),
					eq(studentAdvisors.student_mnumber, studentMnumber)
				)
			);

		return result[0]?.count > 0;
	}
}