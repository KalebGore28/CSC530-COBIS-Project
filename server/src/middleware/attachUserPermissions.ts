import { Request, Response, NextFunction } from 'express';
import { getDbConnection } from '../db/connection';
import { userPermissions, permissions } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to fetch the authenticated user's permissions from the database
 * and attach them to req.user.permissions.
 */
export async function attachUserPermissions(req: any, res: any, next: any) {
  try {
    // Ensure the user is authenticated and has an id.
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const { orm } = await getDbConnection();

    // Query the user's permissions by joining userPermissions and permissions.
    const permissionsResult = await orm
      .select()
      .from(userPermissions)
      .innerJoin(permissions, eq(userPermissions.permission_id, permissions.id))
      .where(eq(userPermissions.user_id, userId))
      .execute();

    // Attach permissions to the request object.
    // You can either attach the raw permissions array or massage it as needed.
    req.user.permissions = permissionsResult;

    next();
  } catch (error: any) {
    console.error('Error attaching user permissions:', error);
    next(error);
  }
}