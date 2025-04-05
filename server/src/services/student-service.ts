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
	 * Get students with pagination and filtering
	 */
	static async getStudents(params: {
		department?: string;
		program?: string;
		term?: string;
		year?: number;
		search?: string;
		advisorMnumber?: string;
		isCobisAdmin?: boolean;
		page: number;
		limit: number;
	}): Promise<any> {
		const {
			department,
			program,
			term,
			year,
			search,
			advisorMnumber,
			isCobisAdmin = false,
			page = 1,
			limit = 20
		} = params;

		const db = (await getDbConnection()).orm;
		const offset = (page - 1) * limit;

		// Implement fail-closed approach: require specific filters unless user is COBIS admin
		// If not a COBIS admin, and no department or advisor filter, return empty result
		if (!isCobisAdmin && !department && !advisorMnumber) {
			return {
				students: [],
				pagination: {
					page,
					limit,
					totalItems: 0,
					totalPages: 0
				}
			};
		}

		// Build conditions for filtering
		let studentConditions: SQL[] = [];
		let programConditions: SQL[] = [];

		// Program filter
		if (program) {
			programConditions.push(eq(studentPrograms.program, program));
		}

		// Department filter - now through programs table
		if (department) {
			programConditions.push(eq(programs.department, department));
		}

		// Term/year filter
		if (term) {
			programConditions.push(eq(studentPrograms.term, term));
		}

		if (year) {
			programConditions.push(eq(studentPrograms.year, year));
		}

		// Search filter
		if (search && search.trim()) {
			const searchValue = `%${search.trim()}%`;

			// Create a definite condition with explicit SQL
			studentConditions.push(
				sql`(${students.first_name} LIKE ${searchValue} OR 
		   ${students.last_name} LIKE ${searchValue} OR 
		   ${students.mnumber} LIKE ${searchValue} OR 
		   ${students.email} LIKE ${searchValue})`
			);
		}

		// Advisor filter
		if (advisorMnumber) {
			const adviseeResults = await db
				.select({ studentMnumber: studentAdvisors.student_mnumber })
				.from(studentAdvisors)
				.where(eq(studentAdvisors.advisor_mnumber, advisorMnumber));

			const advisorStudents = adviseeResults.map(r => r.studentMnumber);

			if (advisorStudents.length === 0) {
				// If advisor has no advisees, return empty result
				return {
					students: [],
					pagination: {
						page,
						limit,
						totalItems: 0,
						totalPages: 0
					}
				};
			}

			studentConditions.push(inArray(students.mnumber, advisorStudents));
		}

		// Determine which students to include based on program filters
		let filteredStudentMnumbers: string[] = [];
		if (programConditions.length > 0) {
			const programFilteredStudents = await db
				.select({ mnumber: studentPrograms.mnumber })
				.from(studentPrograms)
				.innerJoin(programs, eq(studentPrograms.program, programs.code))
				.where(and(...programConditions))
				.groupBy(studentPrograms.mnumber);

			filteredStudentMnumbers = programFilteredStudents.map(s => s.mnumber);

			if (filteredStudentMnumbers.length === 0) {
				// No students match program criteria
				return {
					students: [],
					pagination: {
						page,
						limit,
						totalItems: 0,
						totalPages: 0
					}
				};
			}

			studentConditions.push(inArray(students.mnumber, filteredStudentMnumbers));
		}

		// Get total count for pagination
		const countQuery = db
			.select({ count: count() })
			.from(students);

		// Apply student conditions to count query
		if (studentConditions.length > 0) {
			countQuery.where(and(...studentConditions));
		}

		const totalCount = await countQuery;
		const totalItems = Number(totalCount[0]?.count || 0);
		const totalPages = Math.ceil(totalItems / limit);

		// Base query for student data
		const query = db
			.select({
				mnumber: students.mnumber,
				firstName: students.first_name,
				lastName: students.last_name,
				email: students.email,
				overallGpa: studentAcademicInfo.overall_gpa,
				academicStanding: studentAcademicInfo.academic_standing,
				earnedHours: studentAcademicInfo.overall_earned_hours,
				standingDescription: academicStanding.description
			})
			.from(students)
			.leftJoin(
				studentAcademicInfo,
				eq(students.mnumber, studentAcademicInfo.mnumber)
			)
			.leftJoin(
				academicStanding,
				eq(studentAcademicInfo.academic_standing, academicStanding.code)
			);

		// Apply conditions
		if (studentConditions.length > 0) {
			query.where(and(...studentConditions));
		}

		// Apply pagination and ordering
		const studentResults = await query
			.orderBy(students.last_name, students.first_name)
			.limit(limit)
			.offset(offset);

		// Get student mnumbers for program lookup
		const studentMnumbers = studentResults.map(s => s.mnumber);

		// Get current programs for these students
		const studentProgramsData = await db
			.select({
				mnumber: studentPrograms.mnumber,
				programCode: programs.code,
				programDescription: programs.description,
				departmentCode: departments.code,
				departmentDescription: departments.description,
				type: studentPrograms.type,
				term: studentPrograms.term,
				year: studentPrograms.year
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.innerJoin(departments, eq(programs.department, departments.code))
			.where(
				and(
					inArray(studentPrograms.mnumber, studentMnumbers),
					eq(studentPrograms.type, 'MAJOR')
				)
			)
			.orderBy(desc(studentPrograms.year), desc(studentPrograms.term));

		// Group programs by student
		const programsByStudent = studentProgramsData.reduce((acc, curr) => {
			if (!acc[curr.mnumber]) {
				acc[curr.mnumber] = [];
			}
			acc[curr.mnumber].push(curr);
			return acc;
		}, {} as Record<string, any[]>);

		// Format the final student list with their primary major
		const formattedStudents = studentResults.map(student => {
			const studentPrograms = programsByStudent[student.mnumber] || [];
			const primaryProgram = studentPrograms[0] || null; // Most recent program

			return {
				mnumber: student.mnumber,
				name: `${student.firstName} ${student.lastName}`,
				firstName: student.firstName,
				lastName: student.lastName,
				email: student.email,
				overallGpa: student.overallGpa,
				academicStanding: student.academicStanding,
				academicStandingDescription: student.standingDescription,
				earnedHours: student.earnedHours,
				primaryProgram: primaryProgram ? {
					code: primaryProgram.programCode,
					description: primaryProgram.programDescription,
					department: primaryProgram.departmentDescription,
					departmentCode: primaryProgram.departmentCode,
					type: primaryProgram.type
				} : null
			};
		});

		return {
			students: formattedStudents,
			pagination: {
				page,
				limit,
				totalItems,
				totalPages
			}
		};
	}

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