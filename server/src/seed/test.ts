import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { seedFacultyPermissions } from './permissions';
import { permissions, rolePermissions } from '../db/schema';
import { eq } from "drizzle-orm";

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.join(__dirname, '../../drizzle/0000_thankful_blob.sql');

(async () => {
	// Create an in-memory database or use your connection
	const db = new Database(':memory:');
	const orm = drizzle(db);

	// Read the migration SQL file
	const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

	// Execute the migration SQL (this assumes the SQL file is safe to run)
	db.exec(migrationSQL);

	console.log("Migration executed successfully.");

	// Seed Faculty permissions
	await seedFacultyPermissions(orm);

	console.log("Faculty permissions seeded successfully.");

	// Verify the permissions were inserted correctly
	const facultyPermissions = await orm
		.select()
		.from(permissions)
		.leftJoin(rolePermissions, eq(permissions.id, rolePermissions.permission_id))
		.where(eq(rolePermissions.role_id, 1))
		.execute();

	console.log("Faculty permissions:", facultyPermissions);
})();