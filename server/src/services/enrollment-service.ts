import { eq, and, count, SQL, inArray, sql, like, or } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	programs,
	studentPrograms,
	departments,
	terms,
	students,
	studentAcademicInfo
} from '../db/schema';

/**
 * Service to handle enrollment data operations
 */
export class EnrollmentService {
	/**
	 * Get program-level enrollment data
	 */
	static async getProgramEnrollment(params: {
		departmentCode: string;
		term?: string;
		year?: number;
		programType?: string;
		level?: string;
	}) {
		const { departmentCode, term, year, programType, level } = params;
		const db = (await getDbConnection()).orm;

		// Build base conditions
		const conditions: SQL[] = [eq(programs.department, departmentCode)];
		const joinConditions: SQL[] = [eq(programs.code, studentPrograms.program)];

		if (term) {
			joinConditions.push(eq(studentPrograms.term, term));
		}

		if (year) {
			joinConditions.push(eq(studentPrograms.year, year));
		}

		if (programType) {
			joinConditions.push(eq(studentPrograms.type, programType));
		}

		if (level) {
			joinConditions.push(eq(studentPrograms.level, level));
		}

		// Get enrollment data by program
		const enrollmentData = await db
			.select({
				programCode: programs.code,
				programDescription: programs.description,
				isMajor: programs.is_major,
				isMinor: programs.is_minor,
				hasConcentration: programs.has_concentration,
				enrollment: count(studentPrograms.mnumber),
				// Count distinct students to handle students in multiple programs
				distinctStudents: sql<number>`COUNT(DISTINCT ${studentPrograms.mnumber})`
			})
			.from(programs)
			.leftJoin(studentPrograms, and(...joinConditions))
			.where(and(...conditions))
			.groupBy(programs.code)
			.orderBy(programs.description);

		// Get department info
		const departmentInfo = await db
			.select({
				code: departments.code,
				description: departments.description
			})
			.from(departments)
			.where(eq(departments.code, departmentCode))
			.limit(1);

		// Get term info if provided
		let termInfo = null;
		if (term) {
			termInfo = await db
				.select({
					code: terms.code,
					description: terms.description
				})
				.from(terms)
				.where(eq(terms.code, term))
				.limit(1);
		}

		// Calculate totals
		const totalEnrollment = enrollmentData.reduce((sum, program) => sum + Number(program.enrollment), 0);

		// Calculate program type and level counts 
		const majorCount = enrollmentData
			.filter(program => Boolean(program.isMajor))
			.reduce((sum, program) => sum + Number(program.enrollment), 0);

		const minorCount = enrollmentData
			.filter(program => Boolean(program.isMinor))
			.reduce((sum, program) => sum + Number(program.enrollment), 0);

		// Get level counts (needs additional query)
		const levelCounts = await db
			.select({
				level: studentPrograms.level,
				count: count()
			})
			.from(studentPrograms)
			.where(
				and(
					eq(studentPrograms.department, departmentCode),
					...(term ? [eq(studentPrograms.term, term)] : []),
					...(year ? [eq(studentPrograms.year, year)] : []),
					...(programType ? [eq(studentPrograms.type, programType)] : [])
				)
			)
			.groupBy(studentPrograms.level);

		// Create a map of level counts
		const levelCountMap: Record<string, number> = {};
		levelCounts.forEach(item => {
			levelCountMap[item.level] = Number(item.count);
		});

		// Format program data with percentages
		const formattedPrograms = enrollmentData.map(program => ({
			code: program.programCode,
			description: program.programDescription,
			isMajor: Boolean(program.isMajor),
			isMinor: Boolean(program.isMinor),
			hasConcentration: Boolean(program.hasConcentration),
			enrollmentCount: Number(program.enrollment),
			distinctStudentCount: Number(program.distinctStudents),
			percentageOfDepartment: totalEnrollment > 0
				? parseFloat(((Number(program.enrollment) / totalEnrollment) * 100).toFixed(2))
				: 0
		}));

		return {
			department: departmentInfo.length > 0
				? {
					code: departmentInfo[0].code,
					description: departmentInfo[0].description
				}
				: { code: departmentCode, description: 'Unknown Department' },

			term: termInfo && termInfo.length > 0
				? {
					code: termInfo[0].code,
					description: termInfo[0].description
				}
				: undefined,

			year,
			programType,
			level,

			programs: formattedPrograms,

			totals: {
				totalEnrollment,
				distinctStudentCount: await this.getDistinctStudentCount(departmentCode, term, year, programType, level),
				majorCount,
				minorCount,
				levelCounts: levelCountMap
			}
		};
	}

	/**
	 * Get student-level details for a specific program
	 */
	static async getProgramStudents(params: {
		programCode: string;
		departmentCode: string;
		term?: string;
		year?: number;
		level?: string;
		page?: number;
		limit?: number;
	}) {
		const { programCode, departmentCode, term, year, level, page = 1, limit = 50 } = params;
		const db = (await getDbConnection()).orm;

		// Calculate offset for pagination
		const offset = (page - 1) * limit;

		// Build conditions
		const conditions: SQL[] = [
			eq(studentPrograms.program, programCode),
			eq(studentPrograms.department, departmentCode)
		];

		if (term) {
			conditions.push(eq(studentPrograms.term, term));
		}

		if (year) {
			conditions.push(eq(studentPrograms.year, year));
		}

		if (level) {
			conditions.push(eq(studentPrograms.level, level));
		}

		// Get program info
		const programInfo = await db
			.select({
				code: programs.code,
				description: programs.description,
				isMajor: programs.is_major,
				isMinor: programs.is_minor,
				hasConcentration: programs.has_concentration
			})
			.from(programs)
			.where(eq(programs.code, programCode))
			.limit(1);

		if (programInfo.length === 0) {
			throw new Error(`Program not found: ${programCode}`);
		}

		// Get total count for pagination
		const totalCountResult = await db
			.select({
				count: count()
			})
			.from(studentPrograms)
			.where(and(...conditions));

		const totalCount = Number(totalCountResult[0]?.count || 0);
		const totalPages = Math.ceil(totalCount / limit);

		// Get student data
		const studentData = await db
			.select({
				mnumber: studentPrograms.mnumber,
				firstName: students.first_name,
				lastName: students.last_name,
				email: students.email,
				programType: studentPrograms.type,
				programLevel: studentPrograms.level,
				term: studentPrograms.term,
				year: studentPrograms.year,
				overall_gpa: studentAcademicInfo.overall_gpa,
				msu_gpa: studentAcademicInfo.msu_gpa,
				academicStanding: studentAcademicInfo.academic_standing,
				earned_hours: studentAcademicInfo.overall_earned_hours
			})
			.from(studentPrograms)
			.innerJoin(students, eq(studentPrograms.mnumber, students.mnumber))
			.leftJoin(
				studentAcademicInfo,
				eq(studentPrograms.mnumber, studentAcademicInfo.mnumber)
			)
			.where(and(...conditions))
			.orderBy(students.last_name, students.first_name)
			.limit(limit)
			.offset(offset);

		// Get term info if provided
		let termInfo = null;
		if (term) {
			termInfo = await db
				.select({
					code: terms.code,
					description: terms.description
				})
				.from(terms)
				.where(eq(terms.code, term))
				.limit(1);
		}

		// Get department info
		const departmentInfo = await db
			.select({
				code: departments.code,
				description: departments.description
			})
			.from(departments)
			.where(eq(departments.code, departmentCode))
			.limit(1);

		// Format the student data
		const formattedStudents = studentData.map(student => ({
			mnumber: student.mnumber,
			firstName: student.firstName,
			lastName: student.lastName,
			email: student.email,
			programType: student.programType,
			programLevel: student.programLevel,
			academicInfo: {
				msu_gpa: student.msu_gpa,
				overall_gpa: student.overall_gpa,
				earned_hours: student.earned_hours,
				academicStanding: student.academicStanding
			}
		}));

		return {
			program: {
				code: programInfo[0].code,
				description: programInfo[0].description,
				isMajor: Boolean(programInfo[0].isMajor),
				isMinor: Boolean(programInfo[0].isMinor),
				hasConcentration: Boolean(programInfo[0].hasConcentration)
			},
			department: departmentInfo.length > 0
				? {
					code: departmentInfo[0].code,
					description: departmentInfo[0].description
				}
				: { code: departmentCode, description: 'Unknown Department' },
			term: termInfo && termInfo.length > 0
				? {
					code: termInfo[0].code,
					description: termInfo[0].description
				}
				: undefined,
			year,
			level,
			pagination: {
				page,
				limit,
				totalItems: totalCount,
				totalPages
			},
			students: formattedStudents
		};
	}

	/**
	 * Check if a program belongs to a specific department
	 */
	static async isProgramInDepartment(programCode: string, departmentCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({
				count: count()
			})
			.from(programs)
			.where(
				and(
					eq(programs.code, programCode),
					eq(programs.department, departmentCode)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}

	/**
	 * Get count of distinct students for filtering criteria
	 */
	private static async getDistinctStudentCount(
		departmentCode: string,
		term?: string,
		year?: number,
		programType?: string,
		level?: string
	): Promise<number> {
		const db = (await getDbConnection()).orm;

		const conditions: SQL[] = [eq(studentPrograms.department, departmentCode)];

		if (term) {
			conditions.push(eq(studentPrograms.term, term));
		}

		if (year) {
			conditions.push(eq(studentPrograms.year, year));
		}

		if (programType) {
			conditions.push(eq(studentPrograms.type, programType));
		}

		if (level) {
			conditions.push(eq(studentPrograms.level, level));
		}

		const result = await db
			.select({
				count: sql<number>`COUNT(DISTINCT ${studentPrograms.mnumber})`
			})
			.from(studentPrograms)
			.where(and(...conditions));

		return Number(result[0]?.count || 0);
	}
}