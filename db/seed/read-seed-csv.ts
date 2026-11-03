import fs from "node:fs";
import path from "node:path";
import { parseCSV } from "@/utils/csv-importer/parse-csv";

const CSV_FOLDER = path.join(import.meta.dirname, "csvs");

/**
 * Reads one of the CSVs in db/seed/csvs. Each row is keyed by the CSV's own headers.
 */
export async function readSeedCSV(fileName: string) {
  const fileContent = fs.readFileSync(path.join(CSV_FOLDER, fileName), "utf8");
  // Some exports start with a byte order mark, which would otherwise end up in the first header
  const parsed = await parseCSV(fileContent.replace(/^\uFEFF/, ""));
  return parsed.data;
}

// The CSVs write a missing value as the text NULL
export function nullable(value: string | undefined) {
  return value === undefined || value === "" || value === "NULL" ? null : value;
}
