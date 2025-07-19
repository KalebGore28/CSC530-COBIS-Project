import { DbConnection } from "../db/connection";
import { MappedCSVData } from "../services/new-column-mapping-service";

const BATCH_SIZE = 1000;

export async function importMappedCSVData(
    conn: DbConnection,
    data: MappedCSVData
): Promise<void> {
    for (const { table, rows } of data) {
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            await bulkUpsert(conn, table, batch);
        }
    }
}

async function bulkUpsert(
    conn: DbConnection,
    table: string,
    rows: Record<string, any>[]
): Promise<void> {
    if (rows.length === 0) return;

    const columns = Object.keys(rows[0]);
    const placeholders = `(${columns.map(() => '?').join(',')})`;
    const values = rows.flatMap(row => columns.map(col => row[col]));

    const sql = `
    INSERT INTO \`${table}\` (${columns.map(col => `\`${col}\``).join(', ')})
    VALUES ${rows.map(() => placeholders).join(', ')}
    ON DUPLICATE KEY UPDATE
    ${columns.map(col => `\`${col}\` = VALUES(\`${col}\`)`).join(', ')}
  `;

    try {
        await conn.db.execute(sql, values);
    } catch (error: any) {
        console.error(`❌ Error importing into table "${table}"`);
        console.error(`Failed SQL: ${sql.slice(0, 500)}...`); // truncate if needed
        console.error(`First row:`, rows[0]);
        console.error(`Error message:`, error?.message || error);
        throw error; // propagate it upward
    }
}