import fs from 'node:fs'
import path from 'node:path'
import { parseCSV } from './parse-csv'
import { importData } from './import-data'
import type { createCSVConfig } from './create-csv-config'
import type { MySql2Database } from 'drizzle-orm/mysql2'

/**
 * Reads a CSV file, parses it, and imports the data.
 * @param db - Drizzle database instance
 * @param filePath - Full path to the CSV file
 * @param csvConfig - CSV configuration
 * @returns Promise that resolves when import is complete
 */
export async function importCSVFile(
    db: MySql2Database<any>,
    filePath: string,
    csvConfig: ReturnType<typeof createCSVConfig>,
) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const parsedData = await parseCSV(fileContent)
    const fileName = path.basename(filePath)
    await importData(db, parsedData, fileName, csvConfig)
}
