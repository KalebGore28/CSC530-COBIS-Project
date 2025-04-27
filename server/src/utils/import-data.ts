import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { eq, and } from "drizzle-orm";
import { getDbConnection } from '../db/connection';
import { Database } from "better-sqlite3";
import { FKViolationError, type FKDef } from "../types/import-data";

/** 
 * Fetch the FK definitions for a table. 
 */
export async function getForeignKeys(
	conn: Database,
	tableName: string
): Promise<FKDef[]> {
	// better-sqlite3’s pragma() returns an array of objects:
	return conn.pragma(`foreign_key_list(${tableName})`, { simple: false }) as FKDef[];
}

/**
 * For each FK in `tableName`, verify the parent exists.
 * Throw a detailed error if it doesn’t.
 */
export async function validateFKs<T>(
	conn: Database,
	tableName: string,
	row: T
) {
	const fks = await getForeignKeys(conn, tableName);
	for (const fk of fks) {
		const childVal = (row as any)[fk.from];
		const stmt = conn.prepare(
			`SELECT 1 FROM ${fk.table} WHERE ${fk.to} = ? LIMIT 1`
		);
		const found = stmt.get(childVal);

		if (!found) {
			throw new FKViolationError({
				tableName,
				childColumn: fk.from,
				parentTable: fk.table,
				parentColumn: fk.to,
				childValue: childVal,
			});
		}
	}
}

/**
 * Import data into a table.
 * This function handles the import of data into a specified table.
 * It checks for existing records based on the Composite/Primary key, and either inserts new records or updates existing ones.
 * It also handles error logging and provides detailed results.
 * Most of the database tables were designed in a way that supports historical data by using Composite/Primary Keys. Exceptions would be lookup tables.
 * As long as the primary key is unique, the database will not allow duplicate entries.
 * @param table - The table to import data into.
 * @param primaryKey - The primary key or composite key of the table.
 * @param mappedData - The data to import, in the form of an array of objects.
 * @returns An object containing the results of the import operation, including counts of inserted, updated, skipped, and failed records.
 * @throws Error if the data is invalid or if there are issues during the import process.
 * @example
 * const result = await importData(
 *   table,
 *   ['mnumber', 'code', 'date'],
 *   mappedData
 * );
 */
export async function importData<T extends Record<string, any>>(
	table: AnySQLiteTable,
	primaryKeys: string[],
	mappedData: T[],
) {
	const { db: conn, orm: db } = await getDbConnection();
	const tableName = (table as any).name as string;

	// Validate input
	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		throw new Error("Invalid data: No rows provided.");
	}

	const totalRecords = mappedData.length;
	const errorDetails: Array<{ row: T; error: string }> = [];
	const skippedDetails: Array<{ row: T; reason: string }> = [];
	let inserted = 0;
	let updated = 0;
	let skipped = 0;

	// Get all column names (simplified; adjust based on actual table schema access)
	const allColumns = Object.keys(mappedData[0] || {});
	const nonPrimaryKeyColumns = allColumns.filter(col => !primaryKeys.includes(col));

	if (nonPrimaryKeyColumns.length === 0) {
		// Table has only primary key columns
		for (const row of mappedData) {
			try {
				const result = await db.insert(table)
					.values(row)
					.onConflictDoNothing();
				if (result.changes === 1) {
					inserted++;
				} else if (result.changes === 0) {
					skippedDetails.push({ row, reason: "Duplicate primary key" });
					skipped++;
				}
			} catch (error: any) {
				errorDetails.push({ row, error: error.message });
			}
		}
	} else {
		// Table has non-primary key columns
		// Build a map of existing rows for efficiency (simplified; may need optimization)
		const existingRowsMap = new Map<string, T>();
		for (const row of mappedData) {



			try {
				// 1) run our FK‐checks so we know exactly which value is illegal
				await validateFKs(conn, tableName, row);

				const conditions = primaryKeys.map(key => eq((table as any)[key], row[key]));
				const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
				const existing = await db.select()
					.from(table)
					.where(whereCondition)
					.limit(1);

				const key = primaryKeys.map(k => row[k]).join('|');
				if (existing.length > 0) {
					existingRowsMap.set(key, existing[0] as T);
				}
			} catch (error: any) {
				errorDetails.push({ row, error: `Failed to check existence: ${error.message}` });
			}
		}

		for (const row of mappedData) {
			try {

				// 1) run our FK‐checks so we know exactly which value is illegal
				await validateFKs(conn, tableName, row);

				const key = primaryKeys.map(k => row[k]).join('|');
				const existingRow = existingRowsMap.get(key);

				if (existingRow) {
					// Check if there are non-primary key columns to update
					const updateData = { ...row };
					primaryKeys.forEach(field => delete updateData[field]);
					if (Object.keys(updateData).length > 0) {
						const conditions = primaryKeys.map(key => eq((table as any)[key], row[key]));
						const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
						await db.update(table)
							.set(updateData)
							.where(whereCondition);
						updated++;
					} else {
						skippedDetails.push({ row, reason: "No non-primary key columns to update" });
						skipped++;
					}
				} else {
					await db.insert(table).values(row);
					inserted++;
				}
			} catch (error: any) {
				errorDetails.push({ row, error: error.message });
			}
		}
	}

	// Return detailed results
	return {
		totalRecords,
		inserted,
		updated,
		skipped,
		failed: errorDetails.length,
		errorDetails,
		skippedDetails,
		timestamp: new Date().toISOString(),
	};
}