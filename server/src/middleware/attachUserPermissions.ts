import { Request, Response, NextFunction } from 'express';
import { getDbConnection } from '../db/connection';
import { eq, and } from 'drizzle-orm';
import { roles, permissions, userRoles, userPermissions, rolePermissions } from '../db/schema';

export async function attachUserPermissions(req: any, res: Response, next: NextFunction) {
	try {
		const userId = req.user?.user_id;
		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
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

		// Debugging
		// console.log('Role permissions:', rolePermissionsResult);
		// console.log('Direct permissions:', directPermissionsResult);
		// console.log('All permissions:', allPermissions);

		// Attach to request
		req.user.permissions = allPermissions;
		req.user.roles = allUserRoles;
		next();
	} catch (error: any) {
		console.error('Error attaching user permissions:', error);
		next(error);
	}
}