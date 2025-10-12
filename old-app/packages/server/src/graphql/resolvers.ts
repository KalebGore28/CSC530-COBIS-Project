import { eq, sql, and, or, SQLWrapper, ne, lt, lte, gt, gte } from 'drizzle-orm'
import * as tables from '../db/schema'
import { checkStudentAccess } from './middleware/checkStudentAccess';
import { checkInstructorAccess } from './middleware/checkInstructorAccess';
import { checkEnrollmentAccess } from './middleware/checkEnrollmentAccess';
import { requireRoles } from './middleware/requireRoles';
import { ApolloContext } from '../app';

import { CourseResolver } from './resolvers/course';
import { DepartmentResolver } from './resolvers/department';
import { ProgramResolver } from './resolvers/program';
import { StudentResolver } from './resolvers/student';
import { StudentAcademicInfoResolver } from './resolvers/student-academic-info';
import { StudentAddressResolver } from './resolvers/student-address';
import { StudentAdvisorResolver } from './resolvers/student-advisor';
import { StudentCoursesResolver } from './resolvers/student-course';
import { StudentProgramResolver } from './resolvers/student-program';
import { FacultyResolver } from './resolvers/faculty';
import { RoleResolver } from './resolvers/role';
import { UserResolver } from './resolvers/user';
import { UserRoleResolver } from './resolvers/user-role';
import { InstructorCourseResolver } from './resolvers/instructor-course';

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


type CreateFacultyInput = {
	user_id: string;
	mnumber: string;
	college_code: string;
	department_code: string;
	role_ids: number[];
	enableUser: boolean;
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

			// This is a fallback for when the app is first initialized.
			// So we set it to a conventional default.
			// Once the admin imports the first data, this will be updated automatically.
			if (!currentYear.currentYear || !currentTerm.currentTerm) {
				return {
					year: 1970,
					term: '10',
				}
			}

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
				.where(and(...whereClauses));

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
				.limit(limit);

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
				.orderBy(tables.programs.code);
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
				.orderBy(tables.courses.subject, tables.courses.number, tables.courses.suffix);
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
				.orderBy(tables.user.email);
		}),
		user: requireRoles(['cobis_administrator'], async (_parent: any, args: { id: string }, { db }: ApolloContext) => {
			const [user] = await db
				.select()
				.from(tables.user)
				.where(eq(tables.user.id, args.id))
				.limit(1);
			return user || null;
		}),
		faculty: requireRoles(['cobis_administrator'], async (_parent: any, _args: any, { db }: ApolloContext) => {
			return db
				.select()
				.from(tables.faculty)
				.orderBy(tables.faculty.last_name, tables.faculty.first_name)
		}),
	},

	Course: CourseResolver,
	Department: DepartmentResolver,
	Program: ProgramResolver,

	// Student resolvers
	Student: StudentResolver,
	StudentAcademicInfo: StudentAcademicInfoResolver,
	StudentAddress: StudentAddressResolver,
	StudentAdvisor: StudentAdvisorResolver,
	StudentCourse: StudentCoursesResolver,
	StudentProgram: StudentProgramResolver,

	// Other resolvers
	Faculty: FacultyResolver,
	Role: RoleResolver,
	User: UserResolver,
	UserRole: UserRoleResolver,
	InstructorCourse: InstructorCourseResolver,

	YearTerm: {
		term: (_parent: any, _args: any, { loaders }: ApolloContext) =>
			loaders.term.load(_parent.term),
	},

	Mutation: {
		provisionFaculty: requireRoles(
			['cobis_administrator'],
			async (
				_parent: any,
				args: { input: CreateFacultyInput },
				{ db }: ApolloContext
			) => {
				const {
					user_id,
					mnumber,
					college_code,
					department_code,
					role_ids,
					enableUser,      // ← ADDED (boolean to set user.isEnabled)
				} = args.input;

				// 1) Check if the user exists
				const [existingUser] = await db
					.select()
					.from(tables.user)
					.where(eq(tables.user.id, user_id))
					.limit(1);
				if (!existingUser) {
					throw new Error(`User with ID ${user_id} does not exist.`);
				}

				// 2) Check if another user already has the provided mnumber
				const existingMnumber = await db
					.select()
					.from(tables.user)
					.where(eq(tables.user.mnumber, mnumber))
					.limit(1);
				if (existingMnumber.length > 0 && existingMnumber[0].id !== existingUser.id) {
					throw new Error(`Mnumber ${mnumber} is already assigned to another user.`);
				}

				// 3) Check if the faculty row already exists
				const [existingFaculty] = await db
					.select()
					.from(tables.faculty)
					.where(eq(tables.faculty.mnumber, mnumber))
					.limit(1);

				if (existingFaculty) {
					//
					// === CASE A: “There is already a faculty row with this mnumber” ===
					//

					// 3a) Build an object of faculty‐fields to update (only if non‐null)
					const facultyUpdates: Partial<{
						college: string;
						department: string;
					}> = {};
					if (college_code != null) {
						facultyUpdates.college = college_code;
					}
					if (department_code != null) {
						facultyUpdates.department = department_code;
					}

					if (Object.keys(facultyUpdates).length > 0) {
						await db
							.update(tables.faculty)
							.set(facultyUpdates)
							.where(eq(tables.faculty.mnumber, mnumber));
					}

					// 3b) Now link/update the user record:
					//    - Always set mnumber = existingFaculty.mnumber
					//    - Only set college_code/department_code if provided
					//    - Also set isEnabled based on enableUser
					const userUpdates: Partial<{
						mnumber: string;
						college_code: string;
						department_code: string;
						isEnabled: boolean;           // ← ADDED
					}> = { mnumber: existingFaculty.mnumber, isEnabled: enableUser };

					if (college_code != null) {
						userUpdates.college_code = college_code;
					}
					if (department_code != null) {
						userUpdates.department_code = department_code;
					}

					await db
						.update(tables.user)
						.set(userUpdates)
						.where(eq(tables.user.id, user_id));

					// 3c) Sync user_roles for this user:
					//      1) Delete all old role rows for this user
					//      2) Insert a new row per role_id in role_ids
					await db
						.delete(tables.userRoles)
						.where(eq(tables.userRoles.user_id, user_id));

					if (role_ids.length > 0) {
						// Insert each new (user_id, role_id) pair
						// (you could also batch‐insert if your DB supports it)
						for (const rid of role_ids) {
							await db
								.insert(tables.userRoles)
								.values({ user_id, role_id: rid });
						}
					}

					// 3d) Fetch the (possibly updated) faculty row so we can return it:
					const [updatedFaculty] = await db
						.select()
						.from(tables.faculty)
						.where(eq(tables.faculty.mnumber, mnumber))
						.limit(1);

					return updatedFaculty;
				}

				//
				// === CASE B: “No faculty row exists yet” ===
				//

				// 4a) Split the existingUser.name into first / last:
				const [firstName, ...lastNameParts] = existingUser.name.split(' ');
				const lastName = lastNameParts.join(' ') || '';

				// 4b) Create a new faculty row
				const newFaculty = await db
					.insert(tables.faculty)
					.values({
						mnumber,
						college: college_code,
						department: department_code,
						first_name: firstName,
						last_name: lastName,
					});

				if (!newFaculty) {
					throw new Error('Failed to create new faculty member.');
				}

				// 4c) Now update the user row to link it to this new faculty + set isEnabled
				const userUpdatesOnCreate: Partial<{
					mnumber: string;
					college_code: string;
					department_code: string;
					isEnabled: boolean;        // ← ADDED
				}> = {
					mnumber,
					college_code,
					department_code,
					isEnabled: enableUser,
				};

				await db
					.update(tables.user)
					.set(userUpdatesOnCreate)
					.where(eq(tables.user.id, user_id));

				// 4d) Sync user_roles for this user (just like in CASE A):
				await db
					.delete(tables.userRoles)
					.where(eq(tables.userRoles.user_id, user_id));

				if (role_ids.length > 0) {
					for (const rid of role_ids) {
						await db
							.insert(tables.userRoles)
							.values({ user_id, role_id: rid });
					}
				}

				return newFaculty[0];
			}
		),
	},

}
