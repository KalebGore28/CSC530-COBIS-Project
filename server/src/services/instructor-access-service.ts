// src/services/instructor-access-service.ts
import { SQL, and, eq, count } from 'drizzle-orm';
import { getDbConnection } from '../db/connection';
import { faculty } from '../db/schema';
import { AuthAndPermissionsRequest } from '../types/requests';

/**
 * Service to handle instructor access control
 */
export class InstructorAccessService {
	/**
	 * Determines if a user can access a specific instructor's data
	 */
	async canAccessInstructor(
		user: AuthAndPermissionsRequest,
		instructorMnumber?: string
	): Promise<boolean> {
		// If no instructor specified, this will be handled by filters
		if (!instructorMnumber) return true;

		// System admins can access all instructors
		if (user.roles.some(r => r.role_name === 'cobis_administrator')) {
			return true;
		}

		// Users can access their own data
		if (user.mnumber === instructorMnumber) {
			return true;
		}

		// Department chairs can access instructors in their department
		if (user.roles.some(r => r.role_name === 'department_chair') && user.department) {
			const isInDepartment = await this.isInstructorInDepartment(instructorMnumber, user.department);
			if (isInDepartment) return true;
		}

		// For administrators and program_coordinators, we're currently giving them
		// the same limited access as regular faculty members (following the client's instruction)
		// This can be expanded in the future when requirements are clearer

		// Return false for all other cases - default deny
		return false;
	}

	/**
	 * Check if an instructor belongs to a specific department
	 */
	private async isInstructorInDepartment(instructorMnumber: string, departmentCode: string): Promise<boolean> {
		const db = (await getDbConnection()).orm;

		const result = await db
			.select({ count: count() })
			.from(faculty)
			.where(
				and(
					eq(faculty.mnumber, instructorMnumber),
					eq(faculty.department, departmentCode)
				)
			);

		return Number(result[0]?.count || 0) > 0;
	}

	/**
	 * Returns SQL filters for instructor data queries based on user's role
	 * Can be used for filtering results in controllers
	 */
	getInstructorDataFilters(user: AuthAndPermissionsRequest, instructorMnumber: string): SQL[] {
		const filters: SQL[] = [];

		// System admins and self-access have no restrictions
		if (user.roles.some(r => r.role_name === 'cobis_administrator') ||
			user.mnumber === instructorMnumber) {
			return filters;
		}

		// Department chairs can only access instructors in their department
		if (user.roles.some(r => r.role_name === 'department_chair') && user.department) {
			filters.push(eq(faculty.department, user.department));
		}

		// For other roles, additional filters can be added here
		// when the requirements become clearer

		return filters;
	}
}