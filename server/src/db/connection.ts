// src/db/connection.ts
import Database, { Database as DatabaseType } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../utils/config';
import { users } from './schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DbConnection {
  orm: ReturnType<typeof drizzle>;
  db?: DatabaseType; // Only available for in-memory connections
}

let _dbConnection: Promise<DbConnection> | null = null;

/**
 * Creates a fresh database connection.
 * In test mode, this creates an in-memory DB with migrations (and optional seeding).
 * In production, it uses your config.db.url.
 */
export const createDb = async (
  useInMemory: boolean = false,
  seedTestData: boolean = false
): Promise<DbConnection> => {
  if (useInMemory) {
    const db = new Database(':memory:');
    const orm = drizzle(db);
    const migrationPath = path.join(__dirname, '../../drizzle', '0000_lying_otto_octavius.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    db.exec(migrationSQL);

    if (seedTestData) {
    //   await orm.insert(users).values([
    //     {
    //       id: '1',
    //       email: 'alice@example.com',
    //       display_name: 'Alice',
    //       is_active: false,
    //       last_login: new Date().toISOString(),
    //       created_at: new Date().toISOString(),
    //     },
    //   ]).execute();
    }
    return { orm, db };
  } else {
    const orm = drizzle(config.db.url);
    return { orm };
  }
};

/**
 * Returns the current DB connection.
 * In production, this will be the singleton connection.
 * In test mode, you can call resetDbConnection() to get a fresh connection.
 */
export const getDbConnection = async (): Promise<DbConnection> => {
  if (!_dbConnection) {
    const useInMemory = process.env.NODE_ENV === 'test';
    _dbConnection = createDb(useInMemory, useInMemory);
  }
  return _dbConnection;
};

/**
 * Resets the DB connection.
 * In test mode, calling this will create a fresh in-memory connection.
 */
export const resetDbConnection = async (): Promise<DbConnection> => {
  const useInMemory = process.env.NODE_ENV === 'test';
  _dbConnection = createDb(useInMemory, useInMemory);
  return _dbConnection;
};

// For production code, you might export a singleton:
export const dbConnection: Promise<DbConnection> = getDbConnection();