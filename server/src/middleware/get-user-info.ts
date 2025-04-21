import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthAndPermissionsRequest } from '../types/requests';
import { getDbConnection } from '../db/connection';
import { eq, and } from 'drizzle-orm';
import {
	roles,
	userRoles,
	user,
	faculty,
} from '../db/schema';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';


/**
 * Middleware to attach user permissions to the request object.
 * Permissions are attached as an array of objects with table_name and column_name properties.
 * Roles are attached as an array of objects with role_id and role_name properties.
 */
export const getUserInfo = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Get the database connection
		const db = (await getDbConnection()).orm;

		const userId = (req as AuthenticatedRequest).user.id;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized: User not authenticated' });
			return;
		}

		// 1. Get user information
		const userData = await db
			.select({
				mnumber: user.mnumber,
				is_enabled: user.isEnabled,
			})
			.from(user)
			.where(eq(user.id, userId))
			.execute();

		const userMnumber = userData[0]?.mnumber;
		const userIsEnabled = userData[0]?.is_enabled;



		// 4. Get user roles and their names
		const allUserRoles = await db
			.select({
				role_id: userRoles.role_id,
				role_name: roles.name,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.role_id, roles.id))
			.where(eq(userRoles.user_id, userId))
			.execute();

		// get user department and college by using their mnumber and getting it from the instructors table
		const userInfo = await db
			.select({
				department: faculty.department,
				college: faculty.college,
			})
			.from(faculty)
			.where(eq(faculty.mnumber, userData[0]?.mnumber ?? ''))
			.execute();

		const departmentCode = userInfo[0]?.department;
		const collegeCode = userInfo[0]?.college;

		// Attach to request
		(req as AuthAndPermissionsRequest).roles = allUserRoles;
		(req as AuthAndPermissionsRequest).department = departmentCode;
		(req as AuthAndPermissionsRequest).college = collegeCode;
		(req as AuthAndPermissionsRequest).mnumber = userMnumber;
		(req as AuthAndPermissionsRequest).isEnabled = userIsEnabled;

		// Check if user is enabled
		if (!userIsEnabled) {
			res.status(403).json({ error: 'Forbidden: User is disabled' });
			return;
		}

		next();
	} catch (error: any) {
		next(error);
	}
}