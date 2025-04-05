import { eq, and, count, SQL, inArray, sql, like, or, gte, lt, not } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import {
	programs,
	studentPrograms,
	departments,
	terms,
	students,
	studentAcademicInfo,
	studentCourses,
	courses,
} from '../db/schema';

/**
 * Service to handle enrollment data operations
 */
export class EnrollmentService {
	// --- PROGRAM ENROLLMENT METHODS ---

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
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					eq(programs.department, departmentCode),
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

		// Get program info and validate department
		const programInfo = await db
			.select({
				code: programs.code,
				description: programs.description,
				isMajor: programs.is_major,
				isMinor: programs.is_minor,
				hasConcentration: programs.has_concentration,
				department: programs.department
			})
			.from(programs)
			.where(eq(programs.code, programCode))
			.limit(1);

		if (programInfo.length === 0) {
			throw new Error(`Program not found: ${programCode}`);
		}

		// Verify the program belongs to the requested department
		if (programInfo[0].department !== departmentCode) {
			throw new Error(`Program ${programCode} does not belong to department ${departmentCode}`);
		}

		// Build conditions for student programs
		const conditions: SQL[] = [eq(studentPrograms.program, programCode)];

		if (term) {
			conditions.push(eq(studentPrograms.term, term));
		}

		if (year) {
			conditions.push(eq(studentPrograms.year, year));
		}

		if (level) {
			conditions.push(eq(studentPrograms.level, level));
		}

		// Get total count for pagination
		const totalCountResult = await db
			.select({
				count: count()
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(and(...conditions, eq(programs.department, departmentCode)));

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
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.innerJoin(students, eq(studentPrograms.mnumber, students.mnumber))
			.leftJoin(
				studentAcademicInfo,
				eq(studentPrograms.mnumber, studentAcademicInfo.mnumber)
			)
			.where(and(...conditions, eq(programs.department, departmentCode)))
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

		const conditions: SQL[] = [];

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
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(and(...conditions, eq(programs.department, departmentCode)));

		return Number(result[0]?.count || 0);
	}

	/**
	 * Get enrollment trends for programs over multiple terms/years
	 */
	static async getProgramEnrollmentTrends(params: {
		departmentCode: string;
		programCode?: string;
		yearsBack?: number;
		includeCurrentTerm?: boolean;
	}) {
		const { departmentCode, programCode, yearsBack = 5, includeCurrentTerm = true } = params;
		const db = (await getDbConnection()).orm;

		// Get the current term and year
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();

		// Determine current term based on the date
		const currentMonth = currentDate.getMonth() + 1;
		let currentTermCode = '80'; // Default to Fall

		if (currentMonth >= 1 && currentMonth <= 4) {
			currentTermCode = '10'; // Spring: Jan-Apr
		} else if (currentMonth >= 5 && currentMonth <= 7) {
			currentTermCode = '50'; // Summer: May-Jul
		} else if (currentMonth >= 8 && currentMonth <= 12) {
			currentTermCode = '80'; // Fall: Aug-Dec
		}

		// Calculate the start year (current year - yearsBack)
		const startYear = currentYear - yearsBack;

		// Define our term sequence for sorting
		const termSequence = ['10', '50', '80', '90']; // Spring, Summer, Fall, Winter

		// Build base conditions
		const conditions: SQL[] = [];

		// Condition for year range
		conditions.push(gte(studentPrograms.year, startYear));

		// If we don't want the current term, exclude it
		if (!includeCurrentTerm) {
			conditions.push(
				sql`(${studentPrograms.year} < ${currentYear} OR (${studentPrograms.year} = ${currentYear} AND ${studentPrograms.term} != ${currentTermCode}))`
			);
		}

		// Department filter for programs table
		const departmentFilter = eq(programs.department, departmentCode);

		// Program filter if specified
		let programFilter: SQL | undefined;
		if (programCode) {
			programFilter = eq(studentPrograms.program, programCode);
		}

		// Get enrollment data grouped by term, year, and program
		const enrollmentData = await db
			.select({
				term: studentPrograms.term,
				year: studentPrograms.year,
				program: studentPrograms.program,
				programDescription: programs.description,
				enrollment: count(),
				distinctStudents: sql<number>`COUNT(DISTINCT ${studentPrograms.mnumber})`
			})
			.from(studentPrograms)
			.innerJoin(programs, eq(studentPrograms.program, programs.code))
			.where(
				and(
					...conditions,
					departmentFilter,
					...(programFilter ? [programFilter] : [])
				)
			)
			.groupBy(studentPrograms.term, studentPrograms.year, studentPrograms.program)
			.orderBy(studentPrograms.year, sql`CASE 
	WHEN ${studentPrograms.term} = '10' THEN 1 
	WHEN ${studentPrograms.term} = '50' THEN 2 
	WHEN ${studentPrograms.term} = '80' THEN 3 
	WHEN ${studentPrograms.term} = '90' THEN 4 
	ELSE 5 END`);

		// Get term descriptions for reference
		const termDescriptions = await db
			.select({
				code: terms.code,
				description: terms.description
			})
			.from(terms)
			.where(inArray(terms.code, termSequence));

		// Create a term description lookup
		const termLookup: Record<string, string> = {};
		termDescriptions.forEach(term => {
			termLookup[term.code] = term.description;
		});

		// Group the data by program
		const programGroups: Record<string, any> = {};

		enrollmentData.forEach(entry => {
			if (!programGroups[entry.program]) {
				programGroups[entry.program] = {
					programCode: entry.program,
					programDescription: entry.programDescription,
					terms: []
				};
			}

			// Calculate the display sort order
			const termSortOrder = termSequence.indexOf(entry.term);

			programGroups[entry.program].terms.push({
				term: entry.term,
				termDescription: termLookup[entry.term] || `Term ${entry.term}`,
				year: entry.year,
				displayTerm: `${termLookup[entry.term] || `Term ${entry.term}`} ${entry.year}`,
				sortOrder: (entry.year * 10) + termSortOrder,
				enrollment: Number(entry.enrollment),
				distinctStudents: Number(entry.distinctStudents)
			});
		});

		// Sort terms chronologically within each program
		Object.keys(programGroups).forEach(programCode => {
			programGroups[programCode].terms.sort((a: { sortOrder: number; }, b: { sortOrder: number; }) => a.sortOrder - b.sortOrder);

			// Calculate enrollment changes
			const terms = programGroups[programCode].terms;
			if (terms.length > 1) {
				for (let i = 1; i < terms.length; i++) {
					const prevEnrollment = terms[i - 1].enrollment;
					const currentEnrollment = terms[i].enrollment;

					if (prevEnrollment > 0) {
						terms[i].changeFromPrevious = {
							absolute: currentEnrollment - prevEnrollment,
							percentage: parseFloat((((currentEnrollment - prevEnrollment) / prevEnrollment) * 100).toFixed(1))
						};
					} else {
						terms[i].changeFromPrevious = {
							absolute: currentEnrollment,
							percentage: null // Can't calculate percentage change from zero
						};
					}
				}
			}
		});

		// Format the response
		return {
			department: departmentCode,
			requestedProgram: programCode || null,
			yearsIncluded: yearsBack,
			includesCurrentTerm: includeCurrentTerm,
			currentTerm: {
				term: currentTermCode,
				termDescription: termLookup[currentTermCode] || `Term ${currentTermCode}`,
				year: currentYear
			},
			programs: Object.values(programGroups)
		};
	}

	// --- COURSE ENROLLMENT METHODS ---


}