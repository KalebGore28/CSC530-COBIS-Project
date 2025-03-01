// process.env.NODE_ENV = 'test';
import { seedPermissions } from './permissions';
import { permissions, rolePermissions } from '../db/schema';
import { eq } from "drizzle-orm";
import { getDbConnection } from '../db/connection';

(async () => {
	// Create an in-memory database or use your connection
	const { db, orm } = await getDbConnection();

	// Seed Faculty permissions
	await seedPermissions(orm);

	console.log("Faculty permissions seeded successfully.");

	// Verify the permissions were inserted correctly for the Faculty role
	const facultyPermissions = await orm
		.select()
		.from(permissions)
		.leftJoin(rolePermissions, eq(permissions.id, rolePermissions.permission_id))
		.where(eq(rolePermissions.role_id, 1))
		.execute();

	console.log("Faculty permissions:", facultyPermissions);

	// Verify the permissions were inserted correctly for the Advisor role
	const advisorPermissions = await orm
		.select()
		.from(permissions)
		.leftJoin(rolePermissions, eq(permissions.id, rolePermissions.permission_id))
		.where(eq(rolePermissions.role_id, 2))
		.execute();

	console.log("Advisor permissions:", advisorPermissions);


})();