import type { OptimizedLookup } from "./make-csv-config";

/**
 * Finds matching tables for a given CSV filename using an optimized lookup.
 * @param csvFilename
 * @param lookup
 * @returns
 */
export function findMySqlMatchingTables(
  csvFilename: string,
  optimizedLookup: OptimizedLookup,
): OptimizedLookup["lookup"] extends Map<any, infer V extends { tables: any }>
  ? V["tables"] | null
  : never {
  const result = new Map() as OptimizedLookup["lookup"] extends Map<
    any,
    infer V extends { tables: any }
  >
    ? V["tables"]
    : never;

  for (const [, entry] of optimizedLookup.lookup) {
    if (entry.regex.test(csvFilename)) {
      for (const [tableName, tableDef] of entry.tables) {
        result.set(tableName, tableDef);
      }
    }
  }

  return result.size ? result : null;
}
