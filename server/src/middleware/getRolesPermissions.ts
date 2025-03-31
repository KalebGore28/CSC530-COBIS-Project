import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthAndPermissionsRequest } from '../types/requests';
import { getDbConnection } from '../db/connection';
import { eq, and } from 'drizzle-orm';
import { roles, permissions, userRoles, userPermissions, rolePermissions } from '../db/schema';


/**
 * Middleware to attach user permissions to the request object.
 * Permissions are attached as an array of objects with table_name and column_name properties.
 * Roles are attached as an array of objects with role_id and role_name properties.
 */
export const getRolesPermissions = async (
	req: Request,
	res: Response,
	next: NextFunction,
	minLevel: number = 1
) => {
	try {
		const userId = (req as AuthenticatedRequest).user.id;
		if (!userId) {
			res.status(401).json({ error: 'Unauthorized: User not authenticated' });
			return;
		}

		const { orm } = await getDbConnection();

		// 1. Get permissions from roles
		const rolePermissionsResult = await orm
			.select({
				table_name: permissions.table_name,
				column_name: permissions.column_name,
			})
			.from(userRoles)
			.innerJoin(rolePermissions, eq(userRoles.role_id, rolePermissions.role_id))
			.innerJoin(
				permissions,
				and(
					eq(rolePermissions.table_name, permissions.table_name),
					eq(rolePermissions.column_name, permissions.column_name)
				)
			)
			.where(eq(userRoles.user_id, userId))
			.execute();

		// 2. Get direct user permissions
		const directPermissionsResult = await orm
			.select({
				table_name: permissions.table_name,
				column_name: permissions.column_name,
			})
			.from(userPermissions)
			.innerJoin(
				permissions,
				and(
					eq(userPermissions.table_name, permissions.table_name),
					eq(userPermissions.column_name, permissions.column_name)
				)
			)
			.where(eq(userPermissions.user_id, userId))
			.execute();

		// 3. Get user roles and their names
		const allUserRoles = await orm
			.select({
				role_id: userRoles.role_id,
				role_name: roles.name,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.role_id, roles.id))
			.where(eq(userRoles.user_id, userId))
			.execute();

		// 4. Combine permissions, ensuring no duplicates
		const permissionMap = new Map<string, { table_name: string; column_name: string }>();
		rolePermissionsResult.forEach((perm: any) => {
			const key = `${perm.table_name}.${perm.column_name}`;
			permissionMap.set(key, perm);
		});
		directPermissionsResult.forEach((perm: any) => {
			const key = `${perm.table_name}.${perm.column_name}`;
			permissionMap.set(key, perm);
		});

		const allPermissions = Array.from(permissionMap.values());

		// Attach to request
		(req as AuthAndPermissionsRequest).permissions = allPermissions;
		(req as AuthAndPermissionsRequest).roles = allUserRoles;
		next();
	} catch (error: any) {
		console.error('Error attaching user permissions:', error);
		next(error);
	}
}