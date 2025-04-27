import Database, { Database as DatabaseType } from 'better-sqlite3';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// Adjust the import path to where getForeignKeys and FKDef are defined
import { getForeignKeys } from '../../utils/import-data';
import type { FKDef } from '../../types/import-data';

describe('getForeignKeys', () => {
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
      CREATE TABLE multi_fk (
        id INTEGER PRIMARY KEY,
        parentAId INTEGER,
        parentBId INTEGER,
        FOREIGN KEY(parentAId) REFERENCES parent(id),
        FOREIGN KEY(parentBId) REFERENCES parent(id)
      );
      CREATE TABLE orphan (
        id INTEGER PRIMARY KEY,
        refId INTEGER
      );
    `);
	});

	afterEach(() => {
		db.close();
	});

	it('returns an empty array when no foreign keys exist', async () => {
		const fks = await getForeignKeys(db, 'orphan');
		expect(fks).toEqual([]);
	});

	it('returns the correct foreign key definition for a single FK', async () => {
		const fks = await getForeignKeys(db, 'child');
		expect(fks).toHaveLength(1);
		expect(fks[0]).toMatchObject<FKDef>({
			id: 0,
			seq: 0,
			table: 'parent',
			from: 'parentId',
			to: 'id',
		});
	});

	it('returns all foreign keys for a table with multiple FKs', async () => {
		const fks = await getForeignKeys(db, 'multi_fk');
		expect(fks).toHaveLength(2);
		const fkColumns = fks.map(fk => fk.from).sort();
		expect(fkColumns).toEqual(['parentAId', 'parentBId']);
		fks.forEach(fk => {
			expect(fk.table).toBe('parent');
			expect(fk.to).toBe('id');
		});
	});
});
