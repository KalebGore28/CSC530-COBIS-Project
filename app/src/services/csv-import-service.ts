import axios from 'axios';

import { ImportInfoResponse, ImportResult, TableConfig } from '../types/csv-import-types';

/**
 * CSV Import Service
 * 
 * Provides functionality for CSV import operations including:
 * - Getting import configuration information
 * - Processing CSV imports
 * - Parsing regex patterns from backend
 */
export const CsvImportService = {
  /**
   * Get import configuration information from the backend
   */
  async getImportInfo(): Promise<ImportInfoResponse> {
    try {
      const response = await axios.get('/api/import/info');
      return response.data;
    } catch (error) {
      console.error('Error fetching import info:', error);
      throw error;
    }
  },

  /**
   * Process a CSV import
   * @param file The CSV file to import
   * @param tableId The ID of the table to import into
   * @param columnMapping Optional column mapping override
   */
  async processImport(
    file: File,
    tableId: string,
    columnMapping?: Record<string, string>
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tableId', tableId);

      // Add column mapping if provided
      if (columnMapping) {
        formData.append('columnMapping', JSON.stringify(columnMapping));
      }

      const response = await axios.post('/api/import/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error processing import:', error);
      throw error;
    }
  },

  /**
   * Find the matching table configuration for a file name
   * @param fileName The file name to match
   * @param tables Array of table configurations
   */
  findMatchingTable(fileName: string, tables: TableConfig[]): TableConfig | undefined {
    if (!fileName || !tables.length) return undefined;

    console.log(`Finding match for file: ${fileName}`);

    // Helper function to parse regex pattern strings from backend
    const testPattern = (patternStr: string, testStr: string): boolean => {
      try {
        // Check if it's a regex pattern with delimiters and flags
        const matches = /^\/(.*)\/([gimuy]*)$/.exec(patternStr);

        if (matches) {
          const [_, patternBody, flags] = matches;
          const regex = new RegExp(patternBody, flags);
          return regex.test(testStr);
        }

        // Simple string contains check as fallback
        return testStr.toLowerCase().includes(patternStr.toLowerCase());
      } catch (error) {
        console.error(`Invalid pattern: ${patternStr}`, error);
        return false;
      }
    };

    // First try to match data tables
    const dataTables = tables.filter(t => t.category === 'data');
    for (const table of dataTables) {
      if (!table.matchingPatterns) continue;

      for (const pattern of table.matchingPatterns) {
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched data table ${table.tableName} with pattern ${pattern}`);
          return table;
        }
      }
    }

    // If no data table matched, check lookup tables
    const lookupTables = tables.filter(t => t.category === 'lookup');
    for (const table of lookupTables) {
      if (!table.matchingPatterns) continue;

      for (const pattern of table.matchingPatterns) {
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched lookup table ${table.tableName} with pattern ${pattern}`);
          return table;
        }
      }
    }

    // If the filename is similar to a lookup table name, use that as fallback
    for (const table of lookupTables) {
      const tableNameLower = table.tableName.toLowerCase().replace(/[\s_-]+/g, '');
      const fileNameLower = fileName.toLowerCase().replace(/[\s_-]+/g, '').replace(/\.csv$/, '');

      if (fileNameLower.includes(tableNameLower) || tableNameLower.includes(fileNameLower)) {
        console.log(`✓ Matched lookup table ${table.tableName} by name similarity`);
        return table;
      }
    }

    console.log(`No table matched for ${fileName}`);
    return undefined;
  },

  /**
   * Check if all required fields are mapped
   * @param table The table configuration
   * @param mapping The current column mapping
   */
  areAllRequiredFieldsMapped(
    table: TableConfig | undefined,
    mapping: Record<string, string>
  ): boolean {
    if (!table || !table.columns) return false;

    // Get all required columns
    const requiredColumns = table.columns.filter(col => col && (col.isPrimaryKey));

    if (requiredColumns.length === 0) return true; // If no required columns, mapping is valid

    // Check that all required columns are mapped
    for (const column of requiredColumns) {
      if (!column || !column.dbColumn || !mapping[column.dbColumn]) {
        return false;
      }
    }

    return true;
  }
};

export default CsvImportService;