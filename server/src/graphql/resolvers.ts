// File: src/graphql/resolvers.ts
import { eq, sql, and, or } from 'drizzle-orm'
import * as tables from '../db/schema'
import { checkStudentAccess } from './middleware/checkStudentAccess';
import { checkInstructorAccess } from './middleware/checkInstructorAccess';

export const resolvers = {
	Query: {
		// Search lookup tables
		searchAcademicStandings: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchAdmitCodes: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchColleges: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchCourses: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchDepartments: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchInstructionalMethods: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchNations: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchPartOfTerms: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchPrograms: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
			return await db
				.select()
				.from(tables.programs)
				.where(
					or(
						sql`UPPER(${tables.programs.code}) LIKE ${up + '%'}`,
						sql`UPPER(${tables.programs.description}) LIKE ${'%' + up + '%'}`
					)
				)
				.limit(10);
		},
		searchRegistrationStatuses: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchRoles: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		searchTerms: async (
			_parent: any,
			{ query }: { query: string },
			{ db }: any
		) => {
			const up = query.toUpperCase();
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
		getAcademicStandings: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.academicStanding)
				.orderBy(tables.academicStanding.code)
			return rows || []
		},
		getAdmitCodes: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.admitCodes)
				.orderBy(tables.admitCodes.code)
			return rows || []
		},
		getColleges: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.colleges)
				.orderBy(tables.colleges.code)
			return rows || []
		},
		getCourses: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.courses)
				.orderBy(tables.courses.subject, tables.courses.number, tables.courses.suffix)
			return rows || []
		},
		getDepartments: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.departments)
				.orderBy(tables.departments.code)
			return rows || []
		},
		getInstructionalMethods: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.instructionalMethods)
				.orderBy(tables.instructionalMethods.code)
			return rows || []
		},
		getNations: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.nations)
				.orderBy(tables.nations.code)
			return rows || []
		},
		getPartOfTerms: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.partOfTerm)
				.orderBy(tables.partOfTerm.code)
			return rows || []
		},
		getPrograms: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.programs)
				.orderBy(tables.programs.code)
			return rows || []
		},
		getRegistrationStatuses: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.registrationStatus)
				.orderBy(tables.registrationStatus.code)
			return rows || []
		},
		getRoles: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.roles)
				.orderBy(tables.roles.id)
			return rows || []
		},
		getTerms: async (_: any, __: any, { db }: any) => {
			const rows = await db.select().from(tables.terms)
				.orderBy(tables.terms.code)
			return rows || []
		},
		// Other queries
		student: checkStudentAccess(
			async (_: any, { mnumber }: { mnumber: string }, ctx: any) => {
				const [stud] = await ctx.db
					.select()
					.from(tables.students)
					.where(eq(tables.students.mnumber, mnumber))
					.limit(1)
				return stud || null
			}
		),

		instructor: checkInstructorAccess(
			async (_: any, { mnumber }: { mnumber: string }, ctx: any) => {
				const [fac] = await ctx.db
					.select()
					.from(tables.faculty)
					.where(eq(tables.faculty.mnumber, mnumber))
					.limit(1)
				return fac || null
			}
		),


	},

	Account: {
		user: (acc: any, _: any, { loaders }: any) =>
			loaders.user.load(acc.user_id),
	},

	Department: {
		college: (dept: any, _: any, { loaders }: any) =>
			loaders.college.load(dept.college),
	},

	Faculty: {
		college: (fac: any, _: any, { loaders }: any) =>
			loaders.college.load(fac.college),
		department: (fac: any, _: any, { loaders }: any) =>
			loaders.department.load(fac.department),
		courses_taught: async (
			fac: any,
			args: {
				startTerm?: string
				endTerm?: string
				startYear?: number
				endYear?: number
				courseId?: string
			},
			{ db }: any
		) => {
			const predicates: any[] = [
				eq(tables.instructorCourses.mnumber, fac.mnumber),
			]

			if (args.startTerm != null) {
				predicates.push(
					sql`${tables.instructorCourses.term} >= ${args.startTerm}`
				)
			}
			if (args.endTerm != null) {
				predicates.push(
					sql`${tables.instructorCourses.term} <= ${args.endTerm}`
				)
			}
			if (args.startYear != null) {
				predicates.push(
					sql`${tables.instructorCourses.year} >= ${args.startYear}`
				)
			}
			if (args.endYear != null) {
				predicates.push(
					sql`${tables.instructorCourses.year} <= ${args.endYear}`
				)
			}
			if (args.courseId) {
				const up = args.courseId.toUpperCase()
				predicates.push(
					sql`
				  UPPER(
					${tables.instructorCourses.course_subject}
					|| CAST(${tables.instructorCourses.course_number} AS TEXT)
					|| ${tables.instructorCourses.course_suffix}
				  ) LIKE ${up + '%'}
				`
				)
			}

			return db
				.select()
				.from(tables.instructorCourses)
				.where(and(...predicates))
				.orderBy(
					sql`${tables.instructorCourses.year} desc, ${tables.instructorCourses.term} desc`
				)
		},
	},

	InstructorCourse: {
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),
		course: (row: any, _: any, { loaders }: any) =>
			loaders.course.load(
				`${row.course_subject}|${row.course_number}|${row.course_suffix}`
			),
		students: (row: any, _: any, { db }: any) =>
			db
				.select()
				.from(tables.studentCourses)
				.where(
					and(
						eq(tables.studentCourses.term, row.term),
						eq(tables.studentCourses.year, row.year),
						eq(tables.studentCourses.course_subject, row.course_subject),
						eq(tables.studentCourses.course_number, row.course_number),
						eq(tables.studentCourses.course_suffix, row.course_suffix)
					)
				)
				.orderBy(
					sql`${tables.studentCourses.year} desc, ${tables.studentCourses.term} desc`
				)
	},

	Program: {
		department: (prog: any, _: any, { loaders }: any) =>
			loaders.department.load(prog.department),
		college: (prog: any, _: any, { loaders }: any) =>
			loaders.college.load(prog.college),
	},

	Session: {
		user: (sess: any, _: any, { loaders }: any) =>
			loaders.user.load(sess.user_id),
	},

	StudentAcademicInfo: {
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),

		admit_term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.admit_term),

		admit_code: (row: any, _: any, { loaders }: any) =>
			loaders.admitCode.load(row.admit_code),

		academic_standing: (row: any, _args: any, { loaders }: any) =>
			loaders.academicStanding.load(row.academic_standing),
	},

	StudentAddress: {
		nation: (addr: any, _: any, { loaders }: any) =>
			loaders.nation.load(addr.nation),
	},

	StudentAdvisor: {
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),
	},

	StudentCourse: {
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),
		part_of_term: (row: any, _: any, { loaders }: any) =>
			loaders.partOfTerm.load(row.part_of_term),
		course: (row: any, _: any, { loaders }: any) =>
			loaders.course.load(
				`${row.course_subject}|${row.course_number}|${row.course_suffix}`
			),
		registration_status: (row: any, _: any, { loaders }: any) =>
			loaders.registrationStatus.load(row.registration_status),
		instructional_method: (row: any, _: any, { loaders }: any) =>
			loaders.instructionalMethod.load(row.instructional_method),
		student: (row: any, _: any, { loaders }: any) =>
			loaders.student.load(row.mnumber),
	},

	StudentProgram: {
		term: (row: any, _: any, { loaders }: any) =>
			loaders.term.load(row.term),
		program: (row: any, _: any, { loaders }: any) =>
			loaders.program.load(row.program),
	},

	Student: {
		academic_info: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAcademicInfo)
				.where(eq(tables.studentAcademicInfo.mnumber, stud.mnumber))
				.orderBy(sql`${tables.studentAcademicInfo.year} desc, ${tables.studentAcademicInfo.term} desc`),

		addresses: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAddresses)
				.where(eq(tables.studentAddresses.mnumber, stud.mnumber)),

		advisors: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentAdvisors)
				.where(eq(tables.studentAdvisors.student_mnumber, stud.mnumber))
				.orderBy(sql`${tables.studentAdvisors.year} desc, ${tables.studentAdvisors.term} desc`),

		courses: async (
			stud: any,
			args: {
				startTerm?: string;
				endTerm?: string;
				startYear?: number;
				endYear?: number;
				instructionalMethod?: string;
				registrationStatus?: string;
				partOfTerm?: string;
				courseId?: string;
			},
			{ db }: any
		) => {
			// always filter by the student’s mnumber
			const predicates: any[] = [
				eq(tables.studentCourses.mnumber, stud.mnumber)
			]

			if (args.startTerm != null) {
				predicates.push(
					sql`${tables.studentCourses.term} >= ${args.startTerm}`
				)
			}
			if (args.endTerm != null) {
				predicates.push(
					sql`${tables.studentCourses.term} <= ${args.endTerm}`
				)
			}
			if (args.startYear != null) {
				predicates.push(
					sql`${tables.studentCourses.year} >= ${args.startYear}`
				)
			}
			if (args.endYear != null) {
				predicates.push(
					sql`${tables.studentCourses.year} <= ${args.endYear}`
				)
			}

			if (args.instructionalMethod != null) {
				predicates.push(
					eq(tables.studentCourses.instructional_method, args.instructionalMethod)
				)
			}

			if (args.registrationStatus != null) {
				predicates.push(
					eq(tables.studentCourses.registration_status, args.registrationStatus)
				)
			}

			if (args.partOfTerm != null) {
				predicates.push(
					eq(tables.studentCourses.part_of_term, args.partOfTerm)
				)
			}

			if (args.courseId) {
				const up = args.courseId.toUpperCase()
				predicates.push(
					// build a string like "PSY331A" and do a prefix‐LIKE
					sql`
					UPPER(
					  ${tables.studentCourses.course_subject}
					  || CAST(${tables.studentCourses.course_number} AS TEXT)
					  || ${tables.studentCourses.course_suffix}
					) LIKE ${up + '%'}
				  `
				)
			}

			return db
				.select()
				.from(tables.studentCourses)
				.where(and(...predicates))
				.orderBy(
					sql`${tables.studentCourses.year} desc, ${tables.studentCourses.term} desc`
				)
		},

		programs: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.studentPrograms)
				.where(eq(tables.studentPrograms.mnumber, stud.mnumber)),

		test_scores: (stud: any, _: any, { db }: any) =>
			db.select().from(tables.testScores)
				.where(eq(tables.testScores.mnumber, stud.mnumber))
	},

}
