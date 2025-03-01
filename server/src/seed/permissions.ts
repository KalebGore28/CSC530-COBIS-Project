
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { permissions, rolePermissions } from '../db/schema';
import { seedRoles } from './roles';

// Import Permissions
import { facultyPermissions } from './data/facultyPermissions';

/**
 * Seeds the RBAC tables with minimal permissions for the Faculty role.
 *
 * @param orm - The Drizzle ORM instance.
 *
 */
export async function seedFacultyPermissions(orm: ReturnType<typeof drizzle>): Promise<void> {

	// Populate database
	await orm.insert(permissions).values(facultyPermissions).execute();

	// Populate the role table with the Faculty role if it doesn't exist.
	await seedRoles(orm);


	// Map the Faculty role to these permissions in rolePermissions.
	await orm.insert(rolePermissions).values(
		facultyPermissions.map((_, index) => ({
			role_id: 1, // Faculty role id
			permission_id: index + 1,
		}))
	).execute();
}