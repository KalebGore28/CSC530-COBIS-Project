import { createCSVConfig } from "./create-csv-config";

/**
 * Loops through all tables in configMapping and returns an array of
 * table names whose patterns match the given pattern_input.
 * @param pattern_input - The filename or pattern to match against
 * @param configMapping - The CSV configuration mapping
 * @returns Map of matching table names to their configurations
 */
export const findMatchingTables = (
  pattern_input: string,
  configMapping: ReturnType<typeof createCSVConfig>,
) => {
  const matchingTables = new Map<string, (typeof configMapping.tables)[string]>();

  for (const [tableName, tableMapping] of Object.entries(configMapping.tables)) {
    const patterns = tableMapping.patterns;
    const isMatch = patterns.some((pattern) =>
      pattern instanceof RegExp
        ? pattern.test(pattern_input)
        : new RegExp(pattern).test(pattern_input),
    );
    if (isMatch) {
      matchingTables.set(tableName, tableMapping);
    }
  }

  return matchingTables;
};