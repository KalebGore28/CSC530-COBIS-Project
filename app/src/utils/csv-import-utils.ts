// src/utils/csv-import-utils.ts
import { TableConfig, FilePattern } from '../types/csv-import-types';

/**
 * Check if a filename matches any known data file pattern
 * @param fileName The filename to check
 * @param patterns List of file patterns from the API
 * @returns boolean indicating if the file matches any data pattern
 */
export const isDataFile = (fileName: string, patterns: FilePattern[]): boolean => {
  for (const pattern of patterns) {
    try {
      // Convert string pattern to RegExp
      const patternStr = pattern.pattern;
      const patternBody = patternStr.replace(/^\/|\/[gimuy]*$/g, '');
      const flags = patternStr.match(/\/([gimuy]*)$/)?.[1] || '';
      const regex = new RegExp(patternBody, flags);

      if (regex.test(fileName)) {
        return true;
      }
    } catch (error) {
      console.error(`Invalid regex pattern: ${pattern.pattern}`, error);
    }
  }
  return false;
};

/**
 * Detect the appropriate table from a filename
 * @param fileName The filename to analyze
 * @param patterns List of file patterns from the API
 * @param tables List of available tables
 * @returns The matched table config or null if no match
 */
export const detectTableFromFilename = (
  fileName: string,
  patterns: FilePattern[],
  tables: TableConfig[]
): TableConfig | null => {
  // Go through each pattern and check if filename matches
  for (const pattern of patterns) {
    try {
      // Convert string pattern to RegExp
      const patternStr = pattern.pattern;
      const patternBody = patternStr.replace(/^\/|\/[gimuy]*$/g, '');
      const flags = patternStr.match(/\/([gimuy]*)$/)?.[1] || '';
      const regex = new RegExp(patternBody, flags);

      if (regex.test(fileName)) {
        // If we have a match, look for matching destination table
        for (const destination of pattern.destinations) {
          const matchingTable = tables.find(t =>
            t.tableId === destination.tableId
          );

          if (matchingTable) {
            return matchingTable;
          }
        }
      }
    } catch (error) {
      console.error(`Invalid regex pattern: ${pattern.pattern}`, error);
    }
  }

  // Alternative approach: check matching patterns directly on tables
  for (const table of tables) {
    if (table.matchingPatterns && table.matchingPatterns.length > 0) {
      for (const patternStr of table.matchingPatterns) {
        try {
          const patternBody = patternStr.replace(/^\/|\/[gimuy]*$/g, '');
          const regex = new RegExp(patternBody, 'i'); // Use case-insensitive by default

          if (regex.test(fileName)) {
            return table;
          }
        } catch (error) {
          console.error(`Invalid regex pattern in table: ${patternStr}`, error);
        }
      }
    }
  }

  return null;
};

/**
 * Auto-map CSV columns to table fields
 * @param csvHeaders Array of CSV column headers
 * @param tableColumns Array of table column objects
 * @returns Mapping of table field names to CSV column names
 */
export const autoMapColumns = (
  csvHeaders: string[],
  tableColumns: { name: string; csvColumn: string }[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  // Create lowercase lookup for case-insensitive matching
  const headersLowerMap = new Map<string, string>();
  csvHeaders.forEach(header => {
    headersLowerMap.set(header.toLowerCase().trim(), header);
  });

  // For each table column, try to find a matching CSV header
  tableColumns.forEach(column => {
    // First try exact match with the expected csvColumn 
    let matchedHeader = headersLowerMap.get(column.csvColumn.toLowerCase().trim());

    // If no match found, try using the column name itself
    if (!matchedHeader) {
      matchedHeader = headersLowerMap.get(column.name.toLowerCase().trim());
    }

    // Set the mapping or empty string if no match
    mapping[column.name] = matchedHeader || "";
  });

  return mapping;
};

/**
 * Map CSV data to table fields based on a column mapping
 * @param data 2D array of CSV data
 * @param headers CSV headers
 * @param mapping Mapping of table fields to CSV columns
 * @param columnNames Table column names
 * @returns Array of objects mapping table fields to values
 */
export const mapCsvDataToFields = (
  data: string[][],
  headers: string[],
  mapping: Record<string, string>,
  columnNames: string[]
): Record<string, string>[] => {
  return data.map(row => {
    const rowData: Record<string, string> = {};

    columnNames.forEach(columnName => {
      const csvColumn = mapping[columnName];
      const columnIndex = headers.indexOf(csvColumn);
      rowData[columnName] = columnIndex >= 0 ? row[columnIndex] || "" : "";
    });

    return rowData;
  });
};