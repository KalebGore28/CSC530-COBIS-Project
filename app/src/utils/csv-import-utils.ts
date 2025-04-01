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
    for (const patternStr of pattern.filePatterns) {
      try {
        // Convert string pattern back to RegExp
        // Remove leading/trailing slashes and extract flags
        const patternBody = patternStr.replace(/^\/|\/[gimuy]*$/g, '');
        const flags = patternStr.match(/\/([gimuy]*)$/)?.[1] || '';
        const regex = new RegExp(patternBody, flags);

        if (regex.test(fileName)) {
          return true;
        }
      } catch (error) {
        console.error(`Invalid regex pattern: ${patternStr}`, error);
      }
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
    for (const patternStr of pattern.filePatterns) {
      try {
        // Convert string pattern back to RegExp
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
        console.error(`Invalid regex pattern: ${patternStr}`, error);
      }
    }
  }

  return null;
};

/**
 * Auto-map CSV columns to table fields
 * @param csvHeaders Array of CSV column headers
 * @param tableFields Array of table field objects
 * @returns Mapping of table field names to CSV column names
 */
export const autoMapColumns = (
  csvHeaders: string[],
  tableFields: { name: string; csvColumn: string }[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  // Create lowercase lookup for case-insensitive matching
  const headersLowerMap = new Map<string, string>();
  csvHeaders.forEach(header => {
    headersLowerMap.set(header.toLowerCase().trim(), header);
  });

  // For each table field, try to find a matching CSV header
  tableFields.forEach(field => {
    // First try exact match with the expected csvColumn 
    let matchedHeader = headersLowerMap.get(field.csvColumn.toLowerCase().trim());

    // If no match found, try using the field name itself
    if (!matchedHeader) {
      matchedHeader = headersLowerMap.get(field.name.toLowerCase().trim());
    }

    // Set the mapping or empty string if no match
    mapping[field.name] = matchedHeader || "";
  });

  return mapping;
};

/**
 * Convert a validation result's suggested mapping into a complete mapping
 * @param validationResult Result from the validate-columns API
 * @returns Complete mapping object ready for use
 */
export const buildMappingFromValidation = (
  validationResult: {
    exactMatches: Record<string, string>;
    suggestedMapping: Record<string, string>;
  }
): Record<string, string> => {
  // Combine exact matches with suggested matches
  return {
    ...validationResult.exactMatches,
    ...validationResult.suggestedMapping
  };
};

/**
 * Map CSV data to table fields based on a column mapping
 * @param data 2D array of CSV data
 * @param headers CSV headers
 * @param mapping Mapping of table fields to CSV columns
 * @param fields Table field names
 * @returns Array of objects mapping table fields to values
 */
export const mapCsvDataToFields = (
  data: string[][],
  headers: string[],
  mapping: Record<string, string>,
  fields: string[]
): Record<string, string>[] => {
  return data.map(row => {
    const rowData: Record<string, string> = {};

    fields.forEach(field => {
      const csvColumn = mapping[field];
      const columnIndex = headers.indexOf(csvColumn);
      rowData[field] = columnIndex >= 0 ? row[columnIndex] || "" : "";
    });

    return rowData;
  });
};