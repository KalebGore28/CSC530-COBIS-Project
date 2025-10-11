import { eq } from 'drizzle-orm'
import * as tables from '@/db/schema'
import { requireRoles } from './middleware/requireRoles';
import { ApolloContext } from '@/middleware/apollo-server-context';

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



type CreateFacultyInput = {
	user_id: string;
	mnumber: string;
	college_code: string;
	department_code: string;
	role_ids: number[];
	enableUser: boolean;
}

export const resolvers = {
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
