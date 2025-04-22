import { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { eq, and } from "drizzle-orm";
import { getDbConnection } from '../db/connection';

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
 * @param fileName - The name of the file being imported.
 * @param importedBy - The user who is importing the data.
 * @returns An object containing the results of the import operation, including counts of inserted, updated, skipped, and failed records.
 * @throws Error if the data is invalid or if there are issues during the import process.
 * @example
 * const result = await importData(
 *   table,
 *   ['mnumber', 'code', 'date'],
 *   mappedData,
 *   'test_scores.csv',
 *   'admin'
 * );
 */
export async function importData<T extends Record<string, any>>(
	table: AnySQLiteTable,
	primaryKey: string | string[],
	mappedData: T[],
) {
	const db = (await getDbConnection()).orm;

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

	// Normalize primaryKey to an array for consistent handling
	const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
	// Get all column names (simplified; adjust based on actual table schema access)
	const allColumns = Object.keys(mappedData[0] || {});
	const nonPrimaryKeyColumns = allColumns.filter(col => !keyFields.includes(col));

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
				const conditions = keyFields.map(key => eq((table as any)[key], row[key]));
				const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
				const existing = await db.select()
					.from(table)
					.where(whereCondition)
					.limit(1);

				const key = keyFields.map(k => row[k]).join('|');
				if (existing.length > 0) {
					existingRowsMap.set(key, existing[0] as T);
				}
			} catch (error: any) {
				errorDetails.push({ row, error: `Failed to check existence: ${error.message}` });
			}
		}

		for (const row of mappedData) {
			try {
				const key = keyFields.map(k => row[k]).join('|');
				const existingRow = existingRowsMap.get(key);

				if (existingRow) {
					// Check if there are non-primary key columns to update
					const updateData = { ...row };
					keyFields.forEach(field => delete updateData[field]);
					if (Object.keys(updateData).length > 0) {
						const conditions = keyFields.map(key => eq((table as any)[key], row[key]));
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
	// Log error details
	if (errorDetails.length > 0) {
		//iterate over errorDetails and log them
		for (const errorDetail of errorDetails) {
			console.log(`Error importing row: ${JSON.stringify(errorDetail.row)} - Error: ${errorDetail.error}`);
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