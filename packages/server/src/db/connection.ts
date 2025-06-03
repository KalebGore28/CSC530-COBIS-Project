// src/db/connection.ts
import { DefaultLogger } from 'drizzle-orm/logger';

import fs from 'fs';
import Database, { Database as DatabaseType } from 'better-sqlite3';
import {
	drizzle,
	BetterSQLite3Database,
} from 'drizzle-orm/better-sqlite3';

import * as tables from './schema';

export interface DbConnection {
	db: DatabaseType;
	orm: BetterSQLite3Database<typeof tables>;
}

let _dbConnection: Promise<DbConnection> | null = null;

export const createDb = async (
	useInMemory = false
): Promise<DbConnection> => {
	// 1) Open the raw SQLite handle:
	const filename = useInMemory ? ':memory:' : process.env.DB_URL || 'dev.sqlite3';
	console.log('Connecting to database:', filename);
	const db = new Database(filename);

	// 2) If not in memory, ensure migrations/schema exist:
	if (!useInMemory) {
		const dbExists = fs.existsSync(filename);
		let hasSchema = false;

		try {
			hasSchema = db
				.prepare(`SELECT name FROM __drizzle_migrations LIMIT 1`)
				.all().length > 0;
		} catch {
			try {
				hasSchema = db
					.prepare(
						`SELECT name FROM sqlite_schema
						WHERE type='table'
						AND name NOT LIKE 'sqlite_%'
						AND name != '__drizzle_migrations'
						LIMIT 1
					`
					)
					.all().length > 0;
			} catch {
				/** still no tables—will error below */
			}
		}

		if (!dbExists || !hasSchema) {
			db.close();
			console.error(
				`Database at ${filename} is new or uninitialized.` +
				` Run 'drizzle-kit migrate' before starting.`
			);
			process.exit(1);
		}
	}

	// 3) Initialize Drizzle **with** your schema definitions:
	const orm = drizzle(db, {
		schema: tables,
		casing: 'snake_case',
		// logger: (process.env.NODE_ENV === 'development' ? new DefaultLogger() : undefined),
	});

	return { db, orm };
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
