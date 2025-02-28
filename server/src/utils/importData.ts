import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import { eq, and } from "drizzle-orm";
import { dbConnection } from '../db/connection';
import { use } from "passport";
import { d } from "drizzle-kit/index-BAUrj6Ib";

/**
 * Imports data into any table.
 *
 * For each row in mappedData, if a row with the given primary key exists, update it;
 * otherwise, insert a new row.
 *
 * @param table - The Drizzle table definition.
 * @param primaryKey - The primary key field name or an array of field names (for composite keys).
 * @param mappedData - Array of data rows (each row should be a key/value mapping).
 * @param fileName - The name of the CSV file (for logging, if needed).
 * @param importedBy - Identifier for who performed the import.
 * @param updateExcludes - Optional array of field names to exclude from updates (default: primaryKey fields).
 * @returns An object with the total records processed and any errors encountered.
 */
export async function importData<T extends Record<string, any>>(
	table: AnySQLiteTable,
	primaryKey: string | string[],
	mappedData: T[],
	fileName: string, // TODO
	importedBy: string, // TODO
	updateExcludes: string[] = []
) {
	// Get the ORM instance from the database
	const db = (await dbConnection).orm;

	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		throw new Error("Invalid CSV data.");
	}

	const totalRecords = mappedData.length;
	const errorDetails: Array<{ row: T; error: string }> = [];

	// Ensure primaryKey is an array.
	const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

	// Always exclude primary key fields from update (you can extend this if needed)
	updateExcludes = [...new Set([...updateExcludes, ...keyFields])];

	for (const row of mappedData) {
		try {
			// Build a where condition dynamically based on the primary key fields.
			const conditions = keyFields.map((key) => eq((table as any)[key], row[key]));
			const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

			// Check if a matching row already exists.
			const existingRows = await db.select().from(table).where(whereCondition).limit(1);

			if (existingRows.length > 0) {
				// For update, remove excluded fields from the row data.
				const updateData = { ...row };
				updateExcludes.forEach((field) => delete updateData[field]);

				await db.update(table).set(updateData).where(whereCondition);
			} else {
				await db.insert(table).values(row);
			}
		} catch (error: any) {
			errorDetails.push({ row, error: error.message });
			console.error(
				`Error processing row with key ${JSON.stringify(keyFields.map((k) => row[k]))}: ${error.message}`
			);
		}
	}

	// Optionally, you could log the import operation here using fileName and importedBy.

	return { totalRecords, errorDetails };
}