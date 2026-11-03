import type { OptimizedLookup } from "./make-csv-config";
import type { ColumnMapping } from "./mapping-types";
import { findMySqlMatchingTables } from "./find-matching-tables";

/**
 * Lists the CSV columns the file's tables read that aren't in its header row,
 * so a file with a renamed or missing column is turned away instead of failing partway with a database error.
 * @param csvFilename
 * @param headers - The CSV's header row
 * @param optimizedLookup
 * @returns The missing column names, or an empty array when nothing is missing
 */
export function findMissingColumns(
  csvFilename: string,
  headers: Array<string>,
  optimizedLookup: OptimizedLookup,
): Array<string> {
  const tables = findMySqlMatchingTables(csvFilename, optimizedLookup);
  if (!tables) return [];

  const neededColumns = new Set<string>();
  for (const [, table] of tables) {
    if (table.config) {
      // config is keyed by database column, with the CSV column it comes from
      const mappings = Object.values(table.config) as Array<ColumnMapping<unknown>>;
      for (const mapping of mappings) neededColumns.add(mapping.csvColumnName);
    } else {
      for (const column of table.requiredColumns) neededColumns.add(column);
    }
  }

  const presentColumns = new Set(headers.map((header) => header.trim()));
  return [...neededColumns].filter((column) => !presentColumns.has(column));
}
