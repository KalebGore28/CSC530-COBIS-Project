
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { permissions, rolePermissions } from '../db/schema';
import { seedRoles } from './roles';

// Import Permissions
import { facultyPermissions } from './data/facultyPermissions';
import { advisorPermissions } from './data/advisorPermissions';

/**
 * Seeds the RBAC tables with minimal permissions for the Faculty role.
 *
 * @param orm - The Drizzle ORM instance.
 *
 */
export async function seedPermissions(orm: ReturnType<typeof drizzle>): Promise<void> {

	// Populate database
	await orm.insert(permissions).values(facultyPermissions).execute();
	await orm.insert(permissions).values(advisorPermissions).execute();

	// Populate the role table with the Faculty role if it doesn't exist.
	await seedRoles(orm);

	// Map the Faculty role to these permissions in rolePermissions.
	await orm.insert(rolePermissions).values(
		facultyPermissions.map((_, index) => ({
			role_id: 1, // Faculty role id
			permission_id: index + 1,
		}))
	).execute(); // 31 permissions in total

	// Map the Advisor role to these permissions in rolePermissions.
	await orm.insert(rolePermissions).values(
		advisorPermissions.map((_, index) => ({
			role_id: 2, // Advisor role id
			permission_id: (index + 31) + 1,
		}))
	).execute(); // 19 permissions in total
}