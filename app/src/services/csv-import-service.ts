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
   * Validate a CSV file against a table schema
   * @param file The CSV file to validate
   * @param tableId The ID of the table to validate against
   */
  async validateCsvFile(file: File, tableId: string): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tableId', tableId);

      const response = await axios.post('/api/import/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error validating CSV file:', error);
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
        console.log(`Testing pattern "${patternStr}" against "${testStr}"`);

        // Check if it's a regex pattern with delimiters and flags
        const matches = /^\/(.*)\/([gimuy]*)$/.exec(patternStr);

        if (matches) {
          const [_, patternBody, flags] = matches;
          console.log(`Parsed regex: pattern=${patternBody}, flags=${flags}`);
          try {
            const regex = new RegExp(patternBody, flags);
            const result = regex.test(testStr);
            console.log(`Regex test result: ${result}`);
            return result;
          } catch (regexError) {
            console.error(`Invalid regex pattern: ${patternBody}`, regexError);
            return false;
          }
        }

        // Simple string contains check as fallback
        const containsResult = testStr.toLowerCase().includes(patternStr.toLowerCase());
        console.log(`Simple contains test result: ${containsResult}`);
        return containsResult;
      } catch (error) {
        console.error(`Error testing pattern: ${patternStr}`, error);
        return false;
      }
    };

    // First try data tables (more specific patterns)
    const dataTables = tables.filter(t => t.category === 'data');
    console.log(`Testing ${dataTables.length} data tables`);

    for (const table of dataTables) {
      if (!table.matchingPatterns || !Array.isArray(table.matchingPatterns) || table.matchingPatterns.length === 0) {
        console.log(`Table ${table.tableName} has no patterns to match`);
        continue;
      }

      console.log(`Checking ${table.matchingPatterns.length} patterns for table ${table.tableName}`);
      for (const pattern of table.matchingPatterns) {
        if (!pattern) continue;
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched data table ${table.tableName} with pattern ${pattern}`);
          return table;
        }
      }
    }

    // If no data table matched, check lookup tables
    const lookupTables = tables.filter(t => t.category === 'lookup');
    console.log(`Testing ${lookupTables.length} lookup tables`);

    // First try exact pattern matching for lookup tables
    for (const table of lookupTables) {
      if (!table.matchingPatterns || !Array.isArray(table.matchingPatterns) || table.matchingPatterns.length === 0) {
        console.log(`Lookup table ${table.tableName} has no patterns to match`);
        continue;
      }

      console.log(`Checking ${table.matchingPatterns.length} patterns for lookup table ${table.tableName}`);
      for (const pattern of table.matchingPatterns) {
        if (!pattern) continue;
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched lookup table ${table.tableName} with pattern ${pattern}`);
          return table;
        }
      }
    }

    // Special case: If the file name appears to be a lookup table (contains common lookup table words)
    const lookupKeywords = ['lookup', 'code', 'reference', 'dictionary', 'enum', 'list', 'standing', 'status', 'type'];
    const fileNameLower = fileName.toLowerCase();
    if (lookupKeywords.some(keyword => fileNameLower.includes(keyword))) {
      console.log(`File name ${fileName} contains lookup keywords`);

      // Try to find by name similarity first
      for (const table of lookupTables) {
        const tableNameLower = table.tableName.toLowerCase().replace(/[\s_-]+/g, '');
        const fileNameNormalized = fileNameLower.replace(/[\s_-]+/g, '').replace(/\.csv$/, '');

        if (fileNameNormalized.includes(tableNameLower) || tableNameLower.includes(fileNameNormalized)) {
          console.log(`✓ Matched lookup table ${table.tableName} by name similarity`);
          return table;
        }
      }
    }

    console.log(`No table matched for ${fileName}`);
    return undefined;
  },

  /**
   * Submit corrections for import errors
   * @param tableId The ID of the table with errors
   * @param corrections The corrected data
   */
  async submitCorrections(
    tableId: string,
    corrections: Record<string, any>[]
  ): Promise<ImportResult> {
    try {
      const response = await axios.post('/api/import/corrections', {
        tableId,
        corrections,
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting corrections:', error);
      throw error;
    }
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
    const requiredColumns = table.columns.filter(col => col && (col.isPrimaryKey || col.isRequired));

    if (requiredColumns.length === 0) return true; // If no required columns, mapping is valid

    // Check that all required columns are mapped
    for (const column of requiredColumns) {
      if (!column || !column.name || !mapping[column.name]) {
        return false;
      }
    }

    return true;
  }
};

export default CsvImportService;