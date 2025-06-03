import { eq, sql, and, or, SQLWrapper, ne, lt, lte, gt, gte } from 'drizzle-orm'
import * as tables from '../db/schema'
import { checkStudentAccess } from './middleware/checkStudentAccess';
import { checkInstructorAccess } from './middleware/checkInstructorAccess';
import { checkEnrollmentAccess } from './middleware/checkEnrollmentAccess';
import { requireRoles } from './middleware/requireRoles';
import { ApolloContext } from '../app';

import { ProgramResolver } from './resolvers/program';
import { CourseResolver } from './resolvers/course';

// --- TypeScript types for your GraphQL inputs ---
type ComparisonOperator = 'EQ' | 'NE' | 'LT' | 'LTE' | 'GT' | 'GTE';
type GradeValue = 'A' | 'B' | 'C' | 'D' | 'E';

interface CourseFilterInput {
	course: string;
	taken: boolean;
	operator?: ComparisonOperator;
	grade?: GradeValue;
}

interface ProgramFilterInput {
	program: string;
	is_major?: boolean;
	is_minor?: boolean;
}

type StudentBasic = {
	mnumber: string;
	first_name: string;
	last_name: string;
	email: string;
};

interface StudentLookupInput {
	academicLevels?: string[];
	gpaMin?: number;
	gpaMax?: number;
	programs?: ProgramFilterInput[];
	courses?: CourseFilterInput[];
}

// --- Helpers ---
const parseCourseId = (cid: string) => {
	const m = /^([A-Za-z]+)(\d+)([A-Za-z]*)$/.exec(cid);
	if (!m) throw new Error(`Invalid course ID: ${cid}`);
	return { subject: m[1], number: +m[2], suffix: m[3] };
};

function makeKey(course: tables.InstructorCourse) {
	return [course.term, course.year].join('|');
}

const termMap = {
	'10': 'Spring',
	'50': 'Summer',
	'80': 'Fall',
	'90': 'Winter',
}

export const resolvers = {
	Query: {
		// Search lookup tables
		searchAcademicStandings: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.academicStanding)
				.where(
					or(
						sql`UPPER(${tables.academicStanding.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.academicStanding.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchAdmitCodes: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.admitCodes)
				.where(
					or(
						sql`UPPER(${tables.admitCodes.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.admitCodes.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchColleges: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.colleges)
				.where(
					or(
						sql`UPPER(${tables.colleges.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.colleges.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchCourses: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.courses)
				.where(
					sql`
					UPPER(${tables.courses.subject} || CAST(${tables.courses.number} AS TEXT) || ${tables.courses.suffix}) LIKE ${up + '%'} OR
					UPPER(${tables.courses.title}) LIKE ${'%' + up + '%'}
				`
				)
				.limit(10);
		},
		searchDepartments: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.departments)
				.where(
					or(
						sql`UPPER(${tables.departments.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.departments.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchInstructionalMethods: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.instructionalMethods)
				.where(
					or(
						sql`UPPER(${tables.instructionalMethods.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.instructionalMethods.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchNations: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.nations)
				.where(
					or(
						sql`UPPER(${tables.nations.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.nations.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchPartOfTerms: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.partOfTerm)
				.where(
					or(
						sql`UPPER(${tables.partOfTerm.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.partOfTerm.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchPrograms: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.programs)
				.where(
					or(
						sql`UPPER(${tables.programs.code}) LIKE ${up + "%"}`,
						sql`UPPER(${tables.programs.description}) LIKE ${"%" + up + "%"}`
					)
				)
				.limit(10);
		},
		searchRegistrationStatuses: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.registrationStatus)
				.where(
					or(
						sql`UPPER(${tables.registrationStatus.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.registrationStatus.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchRoles: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.roles)
				.where(
					or(
						sql`UPPER(${tables.roles.id}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.roles.name}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchTerms: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
			const up = args.query.toUpperCase();
			return await db
				.select()
				.from(tables.terms)
				.where(
					or(
						sql`UPPER(${tables.terms.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.terms.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},

		// Get all lookup tables
		getAcademicStandings: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.academicStanding)
				.orderBy(tables.academicStanding.code)
			return rows || []
		},
		getAdmitCodes: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.admitCodes)
				.orderBy(tables.admitCodes.code)
			return rows || []
		},
		getColleges: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.colleges)
				.orderBy(tables.colleges.code)
			return rows || []
		},
		getCourses: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.courses)
				.orderBy(tables.courses.subject, tables.courses.number, tables.courses.suffix)
			return rows || []
		},
		getDepartments: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.departments)
				.orderBy(tables.departments.code)
			return rows || []
		},
		getInstructionalMethods: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.instructionalMethods)
				.orderBy(tables.instructionalMethods.code)
			return rows || []
		},
		getNations: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.nations)
				.orderBy(tables.nations.code)
			return rows || []
		},
		getPartOfTerms: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.partOfTerm)
				.orderBy(tables.partOfTerm.code)
			return rows || []
		},
		getPrograms: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.programs)
				.orderBy(tables.programs.code)
			return rows || []
		},
		getRegistrationStatuses: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.registrationStatus)
				.orderBy(tables.registrationStatus.code)
			return rows || []
		},
		getRoles: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.roles)
				.orderBy(tables.roles.id)
			return rows || []
		},
		getTerms: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db.select().from(tables.terms)
				.orderBy(tables.terms.code)
			return rows || []
		},

		// Utility queries
		getCurrentYearTerm: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const [currentYear] = await db
				.select({
					currentYear: sql<number>`MAX(${tables.instructorCourses.year})`
				})
				.from(tables.instructorCourses);

			const [currentTerm] = await db
				.select({
					currentTerm: sql<string>`MAX(${tables.instructorCourses.term})`
				})
				.from(tables.instructorCourses)
				.where(sql`${tables.instructorCourses.year} = ${currentYear?.currentYear}`);



			return {
				year: currentYear?.currentYear,
				term: currentTerm?.currentTerm,
			}
		},

		// --- Protected Queries ---
		student: checkStudentAccess(async (_parent: any, args: { mnumber: string }, { db }: ApolloContext) => {
			const [stud] = await db
				.select()
				.from(tables.students)
				.where(eq(tables.students.mnumber, args.mnumber))
				.limit(1)
			return stud || null
		}
		),
		instructor: checkInstructorAccess(async (_parent: any, args: { mnumber: string }, { db }: ApolloContext) => {
			const [fac] = await db
				.select()
				.from(tables.faculty)
				.where(eq(tables.faculty.mnumber, args.mnumber))
				.limit(1)
			return fac || null
		}
		),
		instructors: async (_parent: any, _args: any, { db }: ApolloContext) => {
			const rows = await db
				.select()
				.from(tables.faculty)
				.orderBy(tables.faculty.last_name, tables.faculty.first_name)
			return rows || []
		},

		// Lookup Query
		lookupStudents: async (
			_parent: any,
			{ filters, offset = 0, limit = 10 }: {
				filters: StudentLookupInput;
				offset?: number;
				limit?: number;
			},
			{ db }: ApolloContext
		): Promise<{ students: StudentBasic[]; totalCount: number }> => {
			const {
				academicLevels,
				gpaMin,
				gpaMax,
				programs,
				courses
			} = filters;

			const whereClauses: SQLWrapper[] = [];

			// 1) GPA filters (unchanged) …
			if (gpaMin != null) {
				whereClauses.push(sql`
				EXISTS (
				  SELECT 1 FROM ${tables.studentAcademicInfo} sai
				  WHERE sai.mnumber = ${tables.students.mnumber}
					AND sai.overall_gpa >= ${gpaMin}
				)
			`);
			}
			if (gpaMax != null) {
				whereClauses.push(sql`
				EXISTS (
				  SELECT 1 FROM ${tables.studentAcademicInfo} sai
				  WHERE sai.mnumber = ${tables.students.mnumber}
					AND sai.overall_gpa <= ${gpaMax}
				)
			`);
			}

			// 2) Academic‐level filters (latest‐row + correct ranges)
			if (academicLevels?.length) {
				const levelClauses: SQLWrapper[] = academicLevels.map(level => {
					switch (level) {
						case 'Freshman':
							// < 30
							return sql`sai1.overall_earned_hours < 30`;
						case 'Sophomore':
							// ≥ 30 AND < 60
							return sql`(sai1.overall_earned_hours >= 30 AND sai1.overall_earned_hours < 60)`;
						case 'Junior':
							// ≥ 60 AND < 90
							return sql`(sai1.overall_earned_hours >= 60 AND sai1.overall_earned_hours < 90)`;
						case 'Senior':
							// ≥ 90 AND < 120
							return sql`(sai1.overall_earned_hours >= 90 AND sai1.overall_earned_hours < 120)`;
						case 'Graduate':
							// ≥ 120
							return sql`sai1.overall_earned_hours >= 120`;
						default:
							throw new Error(`Unknown academic level: ${level}`);
					}
				});

				whereClauses.push(sql`
				EXISTS (
					SELECT 1
					FROM ${tables.studentAcademicInfo} AS sai1
					WHERE sai1.mnumber = ${tables.students.mnumber}
			
					-- only the latest snapshot:
					AND NOT EXISTS (
						SELECT 1
						FROM ${tables.studentAcademicInfo} AS sai2
						WHERE sai2.mnumber = sai1.mnumber
						AND (
							sai2.year  > sai1.year
							OR (sai2.year = sai1.year AND sai2.term > sai1.term)
						)
					)
			
					-- apply the selected‐level ranges
					AND (${or(...levelClauses)})
				)
			`);
			}

			// 3) Program filters (new)
			programs?.forEach(({ program, is_major, is_minor }) => {
				if (is_major) {
					whereClauses.push(sql`
				  EXISTS (
					SELECT 1
					FROM ${tables.studentPrograms} sp
					WHERE sp.mnumber = ${tables.students.mnumber}
					  AND sp.type    = 'MAJOR'
					  AND sp.program = ${program}
				  )
				`);
				}
				if (is_minor) {
					whereClauses.push(sql`
				  EXISTS (
					SELECT 1
					FROM ${tables.studentPrograms} sp
					WHERE sp.mnumber = ${tables.students.mnumber}
					  AND sp.type    = 'MINOR'
					  AND sp.program = ${program}
				  )
				`);
				}
			});

			// 4) Course filters (new combined logic)
			courses?.forEach(({ course, taken, operator, grade }) => {
				const { subject, number, suffix = '' } = parseCourseId(course);

				if (taken) {
					// build base match clauses
					const base: SQLWrapper[] = [
						eq(tables.studentCourses.mnumber, tables.students.mnumber),
						eq(tables.studentCourses.course_subject, subject),
						eq(tables.studentCourses.course_number, number),
						sql`COALESCE(${tables.studentCourses.course_suffix}, '') = ${suffix}`,
					];

					// flip string comparisons so that "A" > "B" academically → invert operators
					if (operator && grade) {
						const map: Record<ComparisonOperator, typeof eq> = {
							EQ: eq,    // = 
							NE: ne,    // !=

							// flipped for academic order:
							LT: gt,    // academically “<”  → string-wise “>=”
							LTE: gte,   // academically “≤” → string-wise “>”
							GT: lt,    // academically “>”  → string-wise “<=”
							GTE: lte,   // academically “≥” → string-wise “<”
						};
						base.push(map[operator](tables.studentCourses.final_grade, grade));
					}

					whereClauses.push(sql`
				  EXISTS (
					SELECT 1
					FROM ${tables.studentCourses}
					WHERE ${and(...base)}
				  )
				`);
				} else {
					// not taken → NOT EXISTS
					whereClauses.push(sql`
				  NOT EXISTS (
					SELECT 1
					FROM ${tables.studentCourses} sc
					WHERE sc.mnumber        = ${tables.students.mnumber}
					  AND sc.course_subject = ${subject}
					  AND sc.course_number  = ${number}
					  AND COALESCE(sc.course_suffix, '') = ${suffix}
				  )
				`);
				}
			});

			// 5) Build base select to count total rows
			const [{ count: totalCount }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(tables.students)
				.where(and(...whereClauses))
				.all();

			// Build paginated fetch
			const studentRows = await db
				.select({
					mnumber: tables.students.mnumber,
					first_name: tables.students.first_name,
					last_name: tables.students.last_name,
					email: tables.students.email,
				})
				.from(tables.students)
				.where(and(...whereClauses))
				.offset(offset)
				.limit(limit)
				.all();

			return {
				students: studentRows,
				totalCount,
			};
		},

		// Enrollment queries
		programs: checkEnrollmentAccess(async (_parent: any, _args: any, { db }: ApolloContext) => {
			return db
				.select()
				.from(tables.programs)
				.orderBy(tables.programs.code)
				.all();
		}),
		program: checkEnrollmentAccess(async (_parent: any, args: { code: string }, { db }: ApolloContext) => {
			const [program] = await db
				.select()
				.from(tables.programs)
				.where(eq(tables.programs.code, args.code))
				.limit(1);
			return program || null;
		}),
		courses: checkEnrollmentAccess(async (_parent: any, _args: any, { db }: ApolloContext) => {
			return db
				.select()
				.from(tables.courses)
				.orderBy(tables.courses.subject, tables.courses.number, tables.courses.suffix)
				.all();
		}),
		course: checkEnrollmentAccess(async (
			_parent: any,
			args: {
				subject: string,
				number: number,
				suffix: string
			}, { db }: ApolloContext) => {
			const { subject, number, suffix = '' } = args;
			const [course] = await db
				.select()
				.from(tables.courses)
				.where(
					and(
						eq(tables.courses.subject, subject),
						eq(tables.courses.number, number),
						eq(tables.courses.suffix, suffix),
					)
				)
				.limit(1);
			return course || null;
		}),

		// Other queries
		users: requireRoles(['cobis_administrator'], async (_parent: any, _args: any, { db }: ApolloContext) => {
			return db
				.select()
				.from(tables.user)
				.orderBy(tables.user.email)
				.all();
		}),
	},

	// Lookup resolvers
	Department: {
		college: (department: tables.Department, _args: any, { loaders }: ApolloContext) =>
			loaders.college.load(department.college),
	},

	Program: ProgramResolver,
	Course: CourseResolver,

	// Student resolvers
	Student: {
		addresses: (student: tables.Student, _args: any, { loaders }: ApolloContext) =>
			loaders.address.load(student.mnumber),
		advisors: (student: tables.Student, _args: any, { loaders }: ApolloContext) =>
			loaders.advisor.load(student.mnumber),
		programs: (student: tables.Student, _args: any, { loaders }: ApolloContext) =>
			loaders.studentProgram.load(student.mnumber),
		academic_info: async (student: tables.Student, args: { term: string, year: number }, { loaders }: ApolloContext) => {
			const { term, year } = args;

			// fetch all academic info for the student
			const allAcademicInfo = loaders.academicInfo.load(student.mnumber);

			// if no term or year is provided, return all academic info
			if (term == null && year == null) return allAcademicInfo;

			// if only a term is provided, return all academic info for that term
			if (term != null && year == null) {
				return allAcademicInfo.then((info) =>
					info.filter((ai) => ai.term === term)
				);
			}

			// if only a year is provided, return all academic info for that year
			if (term == null && year != null) {
				return allAcademicInfo.then((info) =>
					info.filter((ai) => ai.year === year)
				);
			}

			// if both term and year are provided, return all academic info for that term and year
			return allAcademicInfo.then((info) =>
				info.filter((ai) => ai.term === term && ai.year === year)
			);
		},
		courses: (
			student: tables.Student,
			args: {
				startTerm?: string;
				endTerm?: string;
				startYear?: number;
				endYear?: number;
			},
			{ loaders }: ApolloContext
		) => {
			// fetch all courses for the student
			const allCourses = loaders.studentCourse.load(student.mnumber);

			// enforce “both or neither” for start‐range and end‐range
			if ((args.startTerm != null) !== (args.startYear != null)) {
				throw new Error(
					'If you filter by startTerm you must also supply startYear, and vice versa.'
				);
			}

			if ((args.endTerm != null) !== (args.endYear != null)) {
				throw new Error(
					'If you filter by endTerm you must also supply endYear, and vice versa.'
				);
			}

			// if no arguments are provided, return all courses
			if (args.startTerm == null && args.startYear == null && args.endTerm == null && args.endYear == null) {
				return allCourses;
			}

			// if only a start term and year are provided, return all courses for that term and year
			if (args.startTerm != null && args.startYear != null && args.endTerm == null && args.endYear == null) {
				return allCourses.then((courses) =>
					courses.filter((course) => course.term === args.startTerm && course.year === args.startYear)
				);
			}

			// if only an end term and year are provided, return all courses for that term and year
			if (args.startTerm == null && args.startYear == null && args.endTerm != null && args.endYear != null) {
				return allCourses.then((courses) =>
					courses.filter((course) => course.term === args.endTerm && course.year === args.endYear)
				);
			}

			// if both start and end terms and years are provided, return all courses for that range
			if (args.startTerm != null && args.startYear != null && args.endTerm != null && args.endYear != null) {
				return allCourses.then((courses) =>
					courses.filter((course) => {
						const courseTerm = termMap[course.term as keyof typeof termMap];
						const courseYear = course.year;

						// check if the course is within the specified range
						return (
							(courseTerm >= args.startTerm! && courseYear >= args.startYear!) &&
							(courseTerm <= args.endTerm! && courseYear <= args.endYear!)
						);
					})
				);
			}
		},
	},

	StudentAcademicInfo: {
		term: (academicInfo: tables.StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(academicInfo.term),
		admit_term: (academicInfo: tables.StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(academicInfo.admit_term),
		admit_code: (academicInfo: tables.StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
			loaders.admitCode.load(academicInfo.admit_code),
		academic_standing: (academicInfo: tables.StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
			loaders.academicStanding.load(academicInfo.academic_standing),
		student: (academicInfo: tables.StudentAcademicInfo, _args: any, { loaders }: ApolloContext) =>
			loaders.student.load(academicInfo.mnumber),
	},

	StudentAddress: {
		nation: (address: tables.StudentAddress, _args: any, { loaders }: ApolloContext) =>
			loaders.nation.load(address.nation),
		student: (address: tables.StudentAddress, _args: any, { loaders }: ApolloContext) =>
			loaders.student.load(address.mnumber),
	},

	StudentAdvisor: {
		term: (studentAdvisor: tables.StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(studentAdvisor.term),
		student: (studentAdvisor: tables.StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
			loaders.student.load(studentAdvisor.student_mnumber),
		advisor: (studentAdvisor: tables.StudentAdvisor, _args: any, { loaders }: ApolloContext) =>
			loaders.faculty.load(studentAdvisor.advisor_mnumber),
	},

	StudentCourse: {
		term: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(studentCourse.term),
		part_of_term: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.partOfTerm.load(studentCourse.part_of_term),
		course: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.course.load(
				`${studentCourse.course_subject}|${studentCourse.course_number}|${studentCourse.course_suffix}`
			),
		registration_status: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.registrationStatus.load(studentCourse.registration_status),
		instructional_method: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.instructionalMethod.load(studentCourse.instructional_method),
		student: (studentCourse: tables.StudentCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.student.load(studentCourse.mnumber),
	},

	StudentProgram: {
		term: (studentProgram: tables.StudentProgram, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(studentProgram.term),
		program: (studentProgram: tables.StudentProgram, _args: any, { loaders }: ApolloContext) =>
			loaders.program.load(studentProgram.program),
		student: (studentProgram: tables.StudentProgram, _args: any, { loaders }: ApolloContext) =>
			loaders.student.load(studentProgram.mnumber),
	},

	// Other resolvers
	Faculty: {
		college: (faculty: tables.Faculty, _args: any, { loaders }: ApolloContext) =>
			faculty.college ? loaders.college.load(faculty.college) : null,
		department: (faculty: tables.Faculty, _args: any, { loaders }: ApolloContext) =>
			faculty.department ? loaders.department.load(faculty.department) : null,
		courses_taught: async (
			fac: tables.Faculty,
			args: {
				startTerm?: string
				endTerm?: string
				startYear?: number
				endYear?: number
				subject?: string
				number?: number
				suffix?: string
			},
			{ loaders }: ApolloContext
		) => {
			// enforce “both or neither” for start‐range and end‐range
			if ((args.startTerm != null) !== (args.startYear != null)) {
				throw new Error(
					'If you filter by startTerm you must also supply startYear, and vice versa.'
				);
			}
			if ((args.endTerm != null) !== (args.endYear != null)) {
				throw new Error(
					'If you filter by endTerm you must also supply endYear, and vice versa.'
				);
			}

			// fetch ALL courses for this instructor (cached per request)
			const all = await loaders.instructorCourses.load(fac.mnumber);

			// simple compare helper
			const termYearGE = (
				course: tables.InstructorCourse,
				term: string,
				year: number
			) =>
				course.year > year ||
				(course.year === year && course.term >= term);

			const termYearLE = (
				course: tables.InstructorCourse,
				term: string,
				year: number
			) =>
				course.year < year ||
				(course.year === year && course.term <= term);

			return all.filter((course) => {
				if (args.startTerm && args.startYear) {
					if (!termYearGE(course, args.startTerm, args.startYear)) return false;
				}
				if (args.endTerm && args.endYear) {
					if (!termYearLE(course, args.endTerm, args.endYear)) return false;
				}
				if (args.subject && course.course_subject !== args.subject) return false;
				if (args.number && course.course_number !== args.number) return false;
				if (args.suffix && course.course_suffix !== args.suffix) return false;
				return true;
			});
		},
		grade_distribution_trend: async (
			faculty: tables.Faculty,
			args: {
				startTerm: string;
				startYear: number;
				endTerm?: string;
				endYear?: number;
			},
			{ loaders }: ApolloContext
		): Promise<Array<{
			term: tables.Term;
			year: number;
			distributions: Array<{ grade: string; count: number; percentage: number }>;
		}>> => {
			// 1. validate “both or neither” for start/end filters
			if ((args.startTerm != null) !== (args.startYear != null)) {
				throw new Error(
					'If you filter by startTerm you must also supply startYear, and vice versa.'
				);
			}
			if ((args.endTerm != null) !== (args.endYear != null)) {
				throw new Error(
					'If you filter by endTerm you must also supply endYear, and vice versa.'
				);
			}

			// 2. pull in all instructor‐course rows (cached per request)
			const allCourses = await loaders.instructorCourses.load(faculty.mnumber);

			// 3. apply the exact same filtering logic you used for courses_taught
			const inRange = (course: typeof allCourses[number]) => {
				const ge = (t: string, y: number) =>
					course.year > y || (course.year === y && course.term >= t);
				const le = (t: string, y: number) =>
					course.year < y || (course.year === y && course.term <= t);

				if (args.startTerm && args.startYear && !ge(args.startTerm, args.startYear)) return false;
				if (args.endTerm && args.endYear && !le(args.endTerm, args.endYear)) return false;
				return true;
			};
			const filtered = allCourses.filter(inRange);

			// 4. group by term+year
			const groups = new Map<string, { term: tables.Term; year: number; courses: typeof allCourses }>();
			for (const course of filtered) {
				const key = makeKey(course);
				if (!groups.has(key)) {
					groups.set(key, {
						term: { code: course.term, description: termMap[course.term as keyof typeof termMap] || '' },
						year: course.year,
						courses: [],
					});
				}
				groups.get(key)!.courses.push(course);
			}

			// 5. for each group: pull each course’s final distribution, sum counts, compute percentages
			const trend = await Promise.all(
				Array.from(groups.values()).map(async ({ term, year, courses }) => {
					// load all distributions in parallel
					const allDists = await Promise.all(
						courses.map((c) =>
							loaders.finalGradeDistributionByCourse.load(
								[c.term, c.year, c.course_subject, c.course_number, c.course_suffix].join('|')
							)
						)
					);

					// flatten and aggregate counts by grade
					const countMap = new Map<string, number>();
					for (const dist of allDists.flat()) {
						countMap.set(dist.grade, (countMap.get(dist.grade) || 0) + dist.count);
					}

					const total = Array.from(countMap.values()).reduce((a, b) => a + b, 0) || 1;
					const distributions = Array.from(countMap.entries()).map(([grade, count]) => {
						const rawPercent = (count / total) * 100;
						return {
							grade,
							count,
							percentage: parseFloat(rawPercent.toFixed(2)),
						};
					});

					return { term, year, distributions };
				})
			);

			// 6. (optional) sort by year, then term code
			trend.sort((a, b) =>
				a.year !== b.year ? a.year - b.year : a.term.code.localeCompare(b.term.code)
			);

			return trend;
		},
		advisees: async (
			faculty: tables.Faculty,
			args: {
				term?: string;
				year?: number;
			},
			{ loaders }: ApolloContext
		) => {
			// fetch all students for this faculty member (cached per request)
			const all = await loaders.facultyAdvisees.load(faculty.mnumber);

			// if no filters, return all
			if (!args.term && !args.year) return all;

			// otherwise, filter by term/year
			return all.filter((student) => {
				if (args.term && args.year) {
					return student.term === args.term && student.year === args.year;
				}
				if (args.term) {
					return student.term === args.term;
				}
				if (args.year) {
					return student.year === args.year;
				}
				return true;
			});
		},
		user: (faculty: tables.Faculty, _args: any, { loaders }: ApolloContext) =>
			loaders.user.load(faculty.mnumber),
	},

	Role: {
		id: (role: tables.Role, _args: any, _context: ApolloContext) => role.id.toString(),
	},

	User: {
		updatedAt(user: tables.User, _args: any, _context: ApolloContext) {
			// if user.updatedAt is a JS Date or number in ms
			const ms = typeof user.updatedAt === 'number'
				? user.updatedAt
				: user.updatedAt.getTime();
			return Math.floor(ms / 1000);
		},
		createdAt(user: tables.User, _args: any, _context: ApolloContext) {
			// if user.createdAt is a JS Date or number in ms
			const ms = typeof user.createdAt === 'number'
				? user.createdAt
				: user.createdAt.getTime();
			return Math.floor(ms / 1000);
		},
		lastLogin(user: tables.User, _args: any, _context: ApolloContext) {
			// if user.lastLogin is a JS Date or number in ms
			const ms = typeof user.lastLogin === 'number'
				? user.lastLogin
				: user.lastLogin.getTime();
			return Math.floor(ms / 1000);
		},
		roles: (user: tables.User, _args: any, { loaders }: ApolloContext) =>
			loaders.userRoles.load(user.id),
		faculty: (user: tables.User, _args: any, { loaders }: ApolloContext) =>
			loaders.faculty.load(user.mnumber || ''),

	},

	UserRole: {
		user: (userRoles: tables.UserRole, _args: any, { loaders }: ApolloContext) =>
			loaders.user.load(userRoles.user_id),
		role: (userRoles: tables.UserRole, _args: any, { loaders }: ApolloContext) =>
			loaders.role.load(userRoles.role_id),
	},

	InstructorCourse: {
		term: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(instructorCourse.term),
		course: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.course.load(
				[
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		students: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.studentsByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		total_students: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.totalStudentsByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),

		total_credit_hours: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.totalCreditHoursByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		credit_hour: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.creditHourByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		class_gpa: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.classGpaByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		midterm_average: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.midtermAverageByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		final_average: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.finalAverageByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		midterm_grade_distribution: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.midtermGradeDistributionByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
		final_grade_distribution: (instructorCourse: tables.InstructorCourse, _args: any, { loaders }: ApolloContext) =>
			loaders.finalGradeDistributionByCourse.load(
				[
					instructorCourse.term,
					instructorCourse.year,
					instructorCourse.course_subject,
					instructorCourse.course_number,
					instructorCourse.course_suffix,
				].join('|')
			),
	},

	YearTerm: {
		term: (_parent: any, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(_parent.term),
	},
}
