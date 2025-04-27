import Database, { Database as DatabaseType } from 'better-sqlite3';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateFKs } from '../../utils/import-data';
import { FKViolationError } from '../../types/import-data';

describe('validateFKs', () => {
	let db: DatabaseType;

	beforeEach(() => {
		db = new Database(':memory:');
		db.exec(`
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE parent (
        id INTEGER PRIMARY KEY,
        name TEXT
      );

      CREATE TABLE child (
        id INTEGER PRIMARY KEY,
        parentId INTEGER,
        FOREIGN KEY(parentId) REFERENCES parent(id)
      );
    `);
		// insert one valid parent row
		db.prepare('INSERT INTO parent (id, name) VALUES (?, ?)').run(1, 'Alice');
	});

	afterEach(() => {
		db.close();
	});

	it('does not throw for valid foreign key', async () => {
		const row = { id: 1, parentId: 1 };
		await expect(validateFKs(db, 'child', row)).resolves.not.toThrow();
	});

	it('throws FKViolationError for missing parent', async () => {
		const row = { id: 2, parentId: 42 };
		await expect(validateFKs(db, 'child', row)).rejects.toBeInstanceOf(FKViolationError);
	});

	it('error contains correct violation details', async () => {
		const row = { id: 3, parentId: 99 };
		try {
			await validateFKs(db, 'child', row);
		} catch (err: any) {
			expect(err).toBeInstanceOf(FKViolationError);
			const v = err.violation;
			expect(v).toMatchObject({
				tableName: 'child',
				childColumn: 'parentId',
				parentTable: 'parent',
				parentColumn: 'id',
				childValue: 99,
			});
		}
	});
});
