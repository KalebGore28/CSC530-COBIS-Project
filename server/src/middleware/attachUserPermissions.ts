import { Request, Response, NextFunction } from 'express';
import { getDbConnection } from '../db/connection';
import { eq } from 'drizzle-orm';
import {
  roles,
  permissions,
  userRoles,
  userPermissions,
  rolePermissions
} from '../db/schema';

/**
 * Middleware to fetch the authenticated user's permissions from the database.
 * This middleware combines permissions derived from the user's roles (via rolePermissions)
 * and additional permissions assigned directly to the user (via userPermissions).
 * The resulting permissions are attached to req.user.permissions.
 */
export async function attachUserPermissions(req: any, res: any, next: any) {
  try {
    // Ensure the user is authenticated and has an id.
    const userId = req.user.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { orm } = await getDbConnection();

    // 1. Get permissions from roles (via userRoles -> rolePermissions -> permissions)
    const rolePermissionsResult = await orm
      .select({
        permission_id: permissions.id,
        permission_description: permissions.description,
        permission_table: permissions.table_name,
        can_read: permissions.can_read,
        can_write: permissions.can_write,
      })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.role_id, rolePermissions.role_id))
      .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
      .where(eq(userRoles.user_id, userId))
      .execute();

    // 2. Get direct user permissions (from userPermissions -> permissions)
    const directPermissionsResult = await orm
      .select({
        permission_id: permissions.id,
        permission_description: permissions.description,
        permission_table: permissions.table_name,
        can_read: permissions.can_read,
        can_write: permissions.can_write,
      })
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permission_id, permissions.id))
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

    // 3. Combine the two arrays, ensuring no duplicates (by permission_id)
    const permissionMap = new Map<number, {
      permission_id: number;
      permission_description: string;
      permission_table: string;
      can_read: number;
      can_write: number;
    }>();

    rolePermissionsResult.forEach((perm: any) => {
      permissionMap.set(perm.permission_id, perm);
    });
    directPermissionsResult.forEach((perm: any) => {
      permissionMap.set(perm.permission_id, perm);
    });

    const allPermissions = Array.from(permissionMap.values());

    // Attach permissions and roles to the request object
    req.user.permissions = allPermissions;
    req.user.roles = allUserRoles;
    next();
  } catch (error: any) {
    console.error('Error attaching user permissions:', error);
    next(error);
  }
}