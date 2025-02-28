// src/db/connection.ts
import Database, { Database as DatabaseType } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../utils/config';
import { users } from './schema'; // Adjust this import based on your project structure

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DbConnection {
	orm: ReturnType<typeof drizzle>;
	db?: DatabaseType; // Only available for in-memory db connections
}

/**
 * Creates a database connection.
 *
 * @param useInMemory If true, creates an in‑memory database (useful for tests).
 *                    Otherwise, uses the connection URL from config.
 * @param seedTestData If true and useInMemory is true, runs migrations and seeds test data.
 */
export const createDb = async (
	useInMemory: boolean = false,
	seedTestData: boolean = false
): Promise<DbConnection> => {
	if (useInMemory) {
		// Create an in‑memory database instance
		const db = new Database(':memory:');
		const orm = drizzle(db);

		// Run migrations (assumes you generated a migration file with drizzle‑kit)
		const migrationPath = path.join(__dirname, '../../drizzle', '0000_lying_otto_octavius.sql');
		const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
		db.exec(migrationSQL);

		// Optionally seed your tables with test data
		if (seedTestData) {
			await orm.insert(users).values([
				{
					id: '1',
					email: 'alice@example.com',
					display_name: 'Alice',
					is_active: false,
					last_login: new Date().toISOString(),
					created_at: new Date().toISOString(),
				},
			]).execute();

			// const existingUsers = await orm.select().from(users).execute();
			// console.log('Seeded Users:', existingUsers);
		}
		return { orm, db };
	} else {
		// Create a production connection using the URL from config.
		// This will use drizzle’s built‑in connection, e.g.:
		const orm = drizzle(config.db.url);
		return { orm };
	}
};

// Create a singleton connection based on the NODE_ENV.
// For example, if NODE_ENV is "test", we use an in-memory database.
const useInMemory = process.env.NODE_ENV === 'test';

export const dbConnection: Promise<DbConnection> = createDb(useInMemory, useInMemory);