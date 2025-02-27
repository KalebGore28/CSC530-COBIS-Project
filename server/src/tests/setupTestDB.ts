// src/test/setupTestDb.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'libsql';
import { drizzle } from 'drizzle-orm/libsql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create and prepare an in-memory database
export async function createTestDatabase() {
	// 1. Create a new in-memory database instance
	const db = new Database(':memory:');
	const orm = drizzle(':memory:');

	// 2. Read and execute your migration file to set up the schema
	const migrationPath = path.join(__dirname, '../../drizzle', '0000_lying_otto_octavius.sql');
	const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
	db.exec(migrationSQL);

	// 3. Optionally, seed the database with initial test data
	// For example, inserting a user record:
	// await orm.insert(users).values({ id: 1, name: 'Alice', email: 'alice@example.org' });

	// Return both the raw db instance and the drizzle ORM wrapper for use in tests
	return { db, orm };
}