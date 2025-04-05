import { eq, and, or, like, count, SQL, inArray, desc, sql } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	students,
	studentAcademicInfo,
	studentPrograms,
	departments,
	programs,
	colleges,
	studentAdvisors,
	academicStanding,
	terms
} from '../db/schema';

/**
 * Service to handle student data operations
 */
export class StudentService {

	/**
	 * Get detailed information for a specific student
	 */
	static async getStudentInfo(mnumber: string) {
		const db = (await getDbConnection()).orm;

		// Get basic student information
		const studentInfo = await db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				middleName: students.middle_name,
				lastName: students.last_name,
				suffix: students.suffix,
				gender: students.gender,
				birthdate: students.birthdate,
				email: students.email,
				cellPhone: students.cell_phone,
				age: students.age,
				race: students.race_description,
				citizenship: students.citizenship,
				residency: students.residency_description
			})
			.from(students)
			.where(eq(students.mnumber, mnumber))
			.limit(1);

		if (studentInfo.length === 0) {
			return null;
		}

		// Get academic information
		const academicInfo = await db
			.select({
				msuGpa: studentAcademicInfo.msu_gpa,
				overallGpa: studentAcademicInfo.overall_gpa,
				msuAttemptedHours: studentAcademicInfo.msu_attempted_hours,
				msuEarnedHours: studentAcademicInfo.msu_earned_hours,
				overallAttemptedHours: studentAcademicInfo.overall_attempted_hours,
				overallEarnedHours: studentAcademicInfo.overall_earned_hours,
				academicStanding: studentAcademicInfo.academic_standing,
				academicStandingDescription: academicStanding.description,
				admitTerm: studentAcademicInfo.admit_term,
				admitYear: studentAcademicInfo.admit_year,
				admitCode: studentAcademicInfo.admit_code
			})
			.from(studentAcademicInfo)
			.leftJoin(
				academicStanding,
				eq(studentAcademicInfo.academic_standing, academicStanding.code)
			)
			.where(eq(studentAcademicInfo.mnumber, mnumber))
			.limit(1);

		// Get admit term description
		let admitTermDescription = '';
		if (academicInfo.length > 0 && academicInfo[0].admitTerm) {
			const termInfo = await db
				.select({ description: terms.description })
				.from(terms)
				.where(eq(terms.code, academicInfo[0].admitTerm))
				.limit(1);

			admitTermDescription = termInfo[0]?.description || '';
		}

		// Get current programs (majors and minors)
		const programsData = await db
			.select({
				type: studentPrograms.type,
				level: studentPrograms.level,
				program: studentPrograms.program,
				programDescription: programs.description,
				department: departments.code,
				departmentDescription: departments.description,
				college: colleges.code,
				collegeDescription: colleges.description,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.leftJoin(departments, eq(programs.department, departments.code))
			.leftJoin(colleges, eq(programs.college, colleges.code))
			.where(eq(studentPrograms.mnumber, mnumber))
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term), studentPrograms.type);

		// Group programs by type
		const majorPrograms = programsData.filter(p => p.type === 'MAJOR');
		const minorPrograms = programsData.filter(p => p.type === 'MINOR');

		// Get current advisors
		const currentAdvisors = await db
			.select({
				advisorMnumber: studentAdvisors.advisor_mnumber,
				term: studentAdvisors.term,
				year: studentAdvisors.year
			})
			.from(studentAdvisors)
			.where(eq(studentAdvisors.student_mnumber, mnumber))
			.orderBy(desc(studentAdvisors.year), desc(studentAdvisors.term));

		// Format the response
		return {
			studentInfo: studentInfo[0],
			academicInfo: academicInfo.length > 0 ? {
				...academicInfo[0],
				admitTermDescription
			} : null,
			programs: {
				majors: majorPrograms.map(p => ({
					code: p.program,
					description: p.programDescription,
					department: p.departmentDescription,
					college: p.collegeDescription,
					level: p.level,
					term: p.term,
					year: p.year
				})),
				minors: minorPrograms.map(p => ({
					code: p.program,
					description: p.programDescription,
					department: p.departmentDescription,
					college: p.collegeDescription,
					level: p.level,
					term: p.term,
					year: p.year
				}))
			},
			advisors: currentAdvisors.map(a => ({
				mnumber: a.advisorMnumber,
				term: a.term,
				year: a.year
			}))
		};
	}

	/**
	 * Check if a student is in a specific department
	 */
	static async isStudentInDepartment(mnumber: string, departmentCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		// Query needs to join studentPrograms with programs to check department
		const result = await db
			.select({ count: count() })
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					eq(studentPrograms.mnumber, mnumber),
					eq(programs.department, departmentCode)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}

	/**
	 * Check if a student is advised by a specific instructor
	 */
	static async isAdvisee(studentMnumber: string, advisorMnumber: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({ count: count() })
			.from(studentAdvisors)
			.where(
				and(
					eq(studentAdvisors.student_mnumber, studentMnumber),
					eq(studentAdvisors.advisor_mnumber, advisorMnumber)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}
}