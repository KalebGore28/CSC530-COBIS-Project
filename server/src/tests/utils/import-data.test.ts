import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

vi.mock('../../db/connection', () => ({
	getDbConnection: vi.fn(),
}));

import Database, { Database as DatabaseType } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { FKViolationError } from '../../types/import-data';

import { importData } from '../../utils/import-data';
import { getDbConnection } from '../../db/connection';

describe('importData', () => {
	let db: DatabaseType;
	let orm: ReturnType<typeof drizzle>;

	const testTable = sqliteTable('test_table', {
		id: integer('id'),
		name: text('name'),
		value: text('value'),
	});
	const pkOnlyTable = sqliteTable('pk_only', {
		code: text('code'),
	});
	const childTable = sqliteTable('child', {
		id: integer('id'),
		parent_id: integer('parent_id'),
		value: text('value'),
	});

	beforeEach(() => {
		// 1) create an in-memory Better-SQLite3 instance and a Drizzle ORM over it
		db = new Database(':memory:');
		orm = drizzle(db);

		// 2) create tables and turn on FK enforcement
		db.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE test_table (
        id INTEGER,
        name TEXT,
        value TEXT,
        PRIMARY KEY (id, name)
      );
      CREATE TABLE pk_only (
        code TEXT PRIMARY KEY
      );
      CREATE TABLE parent (
        id INTEGER PRIMARY KEY
      );
      CREATE TABLE child (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER,
        value TEXT,
        FOREIGN KEY(parent_id) REFERENCES parent(id)
      );
    `);
		db.exec(`INSERT INTO parent (id) VALUES (10);`);

		// 3) stub out getDbConnection so importData uses *this* db+orm
		const mocked = getDbConnection as Mock;
		mocked.mockReturnValue({ db, orm });
	});

	afterEach(() => {
		db.close();
		vi.clearAllMocks();
	});

	it('reports foreign key violations', async () => {
		const data = [
			{ id: 1, parent_id: 10, value: 'OK' },
			{ id: 2, parent_id: 99, value: 'Bad' },
		];

		const result = await importData(childTable, ['id'], data);

		expect(result.inserted).toBe(1);
		expect(result.failed).toBe(1);
		expect(result.errorDetails[0].error).toBeInstanceOf(FKViolationError);
		expect((result.errorDetails[0].error as FKViolationError).violation).toEqual({
			tableName: 'child',
			childColumn: 'parent_id',
			parentTable: 'parent',
			parentColumn: 'id',
			childValue: 99,
		});
	});
});
