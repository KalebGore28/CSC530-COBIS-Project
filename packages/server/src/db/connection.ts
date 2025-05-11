import Database, { Database as DatabaseType } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import { config } from '../utils/config';

export interface DbConnection {
	orm: ReturnType<typeof drizzle>;
	db: DatabaseType;
}

let _dbConnection: Promise<DbConnection> | null = null;

export const createDb = async (useInMemory: boolean = false): Promise<DbConnection> => {
	if (useInMemory) {
		const db = new Database(':memory:');
		const orm = drizzle(db);
		return { orm, db };
	} else {
		const isProduction = process.env.NODE_ENV === 'production';
		const dbUrl = config.db.url;

		if (isProduction && !dbUrl) {
			throw new Error('DB_URL is required in production mode');
		}

		const finalDbUrl = dbUrl || 'dev.sqlite3';
		console.log('Connecting to database:', finalDbUrl);

		const dbExists = fs.existsSync(finalDbUrl);
		let db: DatabaseType;

		try {
			db = new Database(finalDbUrl);
		} catch (error: any) {
			throw new Error(`Failed to connect to database at ${finalDbUrl}: ${error.message}`);
		}

		// Check if the database has any schema (via __drizzle_migrations or user tables)
		let hasSchema = false;
		try {
			// Try to query __drizzle_migrations
			const hasMigrations = db.prepare(`SELECT name FROM __drizzle_migrations LIMIT 1`).all().length > 0;
			hasSchema = hasMigrations;
		} catch (error: any) {
			// If __drizzle_migrations doesn’t exist, check for user tables
			try {
				const hasUserTables = db.prepare(`SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations' LIMIT 1`).all().length > 0;
				hasSchema = hasUserTables;
			} catch (tableError) {
				// If no tables at all, DB is uninitialized
			}
		}

		if (!dbExists || !hasSchema) {
			db.close();
			console.error(`Database at ${finalDbUrl} is new or uninitialized. Run 'drizzle-kit migrate' to apply migrations before starting the app.\nNote: If you in production, make sure to pass in the DB_URL when applying migrations. Ex: DB_URL=dist/prod.sqlite3 npx drizzle-kit migrate`);
			process.exit(1); // Graceful shutdown
		}

		if (dbExists && !hasSchema) {
			console.warn(`Database ${finalDbUrl} exists but has no schema tracked. Ensure migrations are applied with 'drizzle-kit migrate'.`);
		}

		const orm = drizzle(db);
		return { db, orm };
	}
};

export const getDbConnection = async (): Promise<DbConnection> => {
	if (!_dbConnection) {
		const useInMemory = process.env.NODE_ENV === 'test';
		_dbConnection = createDb(useInMemory);
	}
	return _dbConnection;
};

export const resetDbConnection = async (): Promise<DbConnection> => {
	const useInMemory = process.env.NODE_ENV === 'test';
	_dbConnection = createDb(useInMemory);
	return _dbConnection;
};

export const seedDb = async (
	dbConn: DbConnection,
	seeders: Array<(orm: DbConnection['orm']) => Promise<void>>
): Promise<void> => {
	for (const seeder of seeders) {
		await seeder(dbConn.orm);
	}
};