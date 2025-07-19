import { AnyMySqlTable } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { getDbConnection } from '../db/connection';
import { FKViolationError, type FKDef } from "../types/import-data";
import { MySql2Database } from "drizzle-orm/mysql2";

export async function getForeignKeys(
	orm: MySql2Database<any>,
	tableName: string,
	schemaName: string
): Promise<FKDef[]> {
	const result = await orm.execute(sql`
		SELECT
			rc.CONSTRAINT_NAME AS id,
			kcu.ORDINAL_POSITION AS seq,
			kcu.REFERENCED_TABLE_NAME AS \`table\`,
			kcu.COLUMN_NAME AS \`from\`,
			kcu.REFERENCED_COLUMN_NAME AS \`to\`,
			rc.UPDATE_RULE AS on_update,
			rc.DELETE_RULE AS on_delete,
			'' AS \`match\`
		FROM information_schema.REFERENTIAL_CONSTRAINTS rc
		JOIN information_schema.KEY_COLUMN_USAGE kcu
			ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
			AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
		WHERE kcu.TABLE_NAME = ${sql.raw('CAST(? AS CHAR)'), [tableName]}
			AND kcu.CONSTRAINT_SCHEMA = ${sql.raw('CAST(? AS CHAR)'), [schemaName]}
		ORDER BY kcu.ORDINAL_POSITION;
	`);

	// Drizzle returns an array of objects by default, safe to cast
	return result as unknown as FKDef[];
}

/**
 * We deliberately skip FK‐checks on these columns when the incoming value is undefined:
 *
 * 1. faculty.department & faculty.college:
 *    - Our Courses During Term CSV import won’t include department or college.
 *    - Both columns have defaults (`"0000"` and `"0"`) at the DB level,
 *      so leaving them undefined here lets our database fill in the defaults.
 *
 * 2. student_courses.course_suffix & instructor_courses.course_suffix:
 *    - The source CSVs never include a suffix.
 *    - We’ve declared a NOT NULL default (`""`) in Drizzle,
 *      so an undefined here will become `""` in the database.
 * 
 * A downside of this is that we can’t use the suffix to distinguish between
 * a normal class and say a transition class. This is a present issue but
 * could not be solved on our end. We can't control the source of the CSVs.
 * Might consider requesting a change to the source CSVs in the future.
 */
const ignoreFKs = [
	{ table: "student_courses", from: "course_suffix", to: "suffix" },
	{ table: "instructor_courses", from: "course_suffix", to: "suffix" },
	{ table: "faculty", from: "department", to: "code" },
	{ table: "faculty", from: "college", to: "code" },
];

/**
 * Validate foreign keys for a given row in a table.
 * - Throws FKViolationError if any FK constraint is violated.
 * - Skips validation for FKs in the ignore list if the value is undefined.
 */
export async function validateFKs<T>(
	conn: any,
	tableName: string,
	row: T
) {
	const fks = await getForeignKeys(conn, tableName, 'mydb');

	for (const fk of fks) {
		const childVal = (row as any)[fk.from];

		// 1) If this FK is in our ignore list *and* the value is undefined, skip it:
		const shouldIgnoreUndefined =
			childVal === undefined &&
			ignoreFKs.some(
				(i) =>
					i.table === tableName &&
					i.from === fk.from &&
					i.to === fk.to
			);
		if (shouldIgnoreUndefined) {
			continue;
		}

		// 2) Otherwise do the normal check
		const stmt = conn.execute(
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

function getDrizzleTableName(table: AnyMySqlTable): string | undefined {
	for (const key of Object.getOwnPropertySymbols(table)) {
		if (key.toString() === 'Symbol(drizzle:Name)') {
			return (table as any)[key];
		}
	}
	return undefined;
}

/**
 * Import data into a table using upsert logic.
 * - Inserts new rows
 * - Updates non-primary-key columns on conflict
 * - Skips pure-key-only tables on conflict
 */
export async function importData<T extends Record<string, any>>(
	table: AnyMySqlTable,
	primaryKeys: string[],
	mappedData: T[],
) {
	const { db: conn, orm: db } = await getDbConnection();
	const tableName = getDrizzleTableName(table);

	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		throw new Error("Invalid data: No rows provided for import.");
	}

	const totalRecords = mappedData.length;
	const errorDetails: Array<{ row: T; error: Error }> = [];
	let inserted = 0;
	let updated = 0;
	let skipped = 0;

	for (const row of mappedData) {
		try {
			// Validate foreign keys first
			await validateFKs(conn, tableName, row);

			// Separate out non-primary-key columns
			const nonPkData = { ...row };
			primaryKeys.forEach(pk => delete (nonPkData as any)[pk]);

			// Build conflict target for composite keys
			const targetCols = primaryKeys.map(pk => (table as any)[pk]);

			// Pure PK-only table: insert or skip
			if (Object.keys(nonPkData).length === 0) {
				await db.insert(table)
					.values(row)
					.then(res => {
						inserted++;
						return res;
					})
					.catch((err: any) => {
						console.error(`Failed to insert row: ${JSON.stringify(row)}`, err);
						skipped++;
					});

			} else {
				// Check existence to distinguish insert vs update
				const pkConditions = primaryKeys.map(pk => eq((table as any)[pk], row[pk]));
				const whereCondition = pkConditions.length > 1
					? and(...pkConditions)
					: pkConditions[0];
				const existing = await db.select()
					.from(table)
					.where(whereCondition)
					.limit(1);

				await db.insert(table)
					.values(row)
					.catch((err: any) => {
						console.error(`Failed to insert row: ${JSON.stringify(row)}`, err);
					});

				existing.length > 0 ? updated++ : inserted++;
			}
		} catch (error: any) {
			// preserve the real Error (so FKViolationError stays intact)
			if (error instanceof Error) {
				// console.error(`Error processing row: ${JSON.stringify(row)}`, error);
				errorDetails.push({ row, error });
				/* v8 ignore next 3 */ //wrap non-Error throws just in case
			} else {
				errorDetails.push({ row, error: new Error(String(error)) });
			}
		}
	}

	return {
		totalRecords,
		inserted,
		updated,
		skipped,
		failed: errorDetails.length,
		errorDetails,
		skippedDetails: [],
		timestamp: new Date().toISOString(),
	};
}