import { drizzle } from 'drizzle-orm/better-sqlite3';
import { roles } from '../db/schema';

/**
 * Seeds the RBAC tables with the default roles.
 *
 * @param orm - The Drizzle ORM instance.
 */
export async function seedRoles(orm: ReturnType<typeof drizzle>): Promise<void> {
	// Insert roles
	await orm.insert(roles).values([
		{ name: 'Faculty' },
		{ name: 'Advisors' },
		{ name: 'Program Coordinators' },
		{ name: 'Department Chairs' },
		{ name: 'Administrators/Administrative Assistants' },
		{ name: 'COBIS Administrator' },
	]).execute();
}