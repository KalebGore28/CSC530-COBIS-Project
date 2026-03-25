import fs from 'fs'
import path from 'path'

import type { MySql2Database } from 'drizzle-orm/mysql2'

import { parseCSV } from './parse-csv'

import type { makeMySqlCSVConfig } from './make-csv-config'
import { importMySqlData } from './import-data'

/**
 * Reads a CSV file, parses it, and imports the data.
 * @param db
 * @param filePath
 * @param csvConfig
 */
export async function importMySqlCSVFile(
    db: MySql2Database<any>,
    filePath: string,
    csvConfig: ReturnType<typeof makeMySqlCSVConfig>,
) {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const parsedData = await parseCSV(fileContent)
    const fileName = path.basename(filePath)
    await importMySqlData(db, parsedData, fileName, csvConfig)
}
