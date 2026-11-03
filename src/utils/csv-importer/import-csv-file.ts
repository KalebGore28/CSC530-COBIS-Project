import fs from "fs";

import type { MySql2Database } from "drizzle-orm/mysql2";

import { parseCSV } from "./parse-csv";

import type { makeMySqlCSVConfig } from "./make-csv-config";
import { importMySqlData, type ImportLogEntry, type ImportProgress } from "./import-data";

/**
 * Reads a CSV file, parses it, and imports the data.
 * @param db
 * @param filePath
 * @param fileName
 * @param csvConfig
 * @param progress - Optional progress callback for streaming updates
 * @param log - Optional callback for what's worth keeping in the import's log
 */
export async function importMySqlCSVFile(
  db: MySql2Database<any>,
  filePath: string,
  fileName: string,
  csvConfig: ReturnType<typeof makeMySqlCSVConfig>,
  progress?: (update: ImportProgress) => void,
  log?: (entry: ImportLogEntry) => void,
) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const parsedData = await parseCSV(fileContent);
  await importMySqlData(db, parsedData, fileName, csvConfig, undefined, progress, log);
}
