import axios from 'axios';

import {
  ImportInfoResponse,
  ImportResult,
  TableConfig,
  CsvMapping,
  DataCsvMapping,
  LookupCsvMapping,
  FileMapping
} from '../types/csv-import-types';

/**
 * CSV Import Service
 * 
 * Provides functionality for CSV import operations including:
 * - Getting import configuration information
 * - Processing CSV imports
 * - Finding matching tables and mappings
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
   * Find the matching CSV mapping for a file name
   * @param fileName The name of the file to match
   * @param mappings Array of CSV mappings from the API
   * @returns The matching mapping if found
   */
  findMatchingMapping(fileName: string, mappings: CsvMapping[]): FileMapping | undefined {
    if (!fileName || !mappings.length) return undefined;

    console.log(`Finding mapping for file: ${fileName}`);

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

    // First try to match data mappings (they often have more specific patterns)
    const dataMappings = mappings.filter((m): m is DataCsvMapping => m.category === 'data');
    for (const mapping of dataMappings) {
      if (!mapping.filePatterns || mapping.filePatterns.length === 0) continue;

      for (const pattern of mapping.filePatterns) {
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched data mapping "${mapping.description}" with pattern ${pattern}`);
          return {
            file: new File([], fileName), // Dummy file with filename for logging
            mapping,
            matchedPattern: pattern
          };
        }
      }
    }

    // If no data mapping matched, check lookup mappings
    const lookupMappings = mappings.filter((m): m is LookupCsvMapping => m.category === 'lookup');
    for (const mapping of lookupMappings) {
      if (!mapping.filePatterns || mapping.filePatterns.length === 0) continue;

      for (const pattern of mapping.filePatterns) {
        if (testPattern(pattern, fileName)) {
          console.log(`✓ Matched lookup mapping "${mapping.description}" with pattern ${pattern}`);
          return {
            file: new File([], fileName), // Dummy file with filename for logging
            mapping,
            matchedPattern: pattern
          };
        }
      }
    }

    // If the filename is similar to a lookup table name, use that as fallback
    for (const mapping of lookupMappings) {
      const mappingNameLower = mapping.description.toLowerCase().replace(/[\s_-]+/g, '');
      const fileNameLower = fileName.toLowerCase().replace(/[\s_-]+/g, '').replace(/\.csv$/, '');

      if (fileNameLower.includes(mappingNameLower) || mappingNameLower.includes(fileNameLower)) {
        console.log(`✓ Matched lookup mapping "${mapping.description}" by name similarity`);
        return {
          file: new File([], fileName),
          mapping,
          matchedPattern: 'name-similarity'
        };
      }
    }

    console.log(`No mapping matched for ${fileName}`);
    return undefined;
  },

  /**
   * Find the matching mapping and destination tables for a file
   * This replaces the old findMatchingTable function with a more accurate implementation
   * @param fileName The file name to match
   * @param mappings Array of CSV mappings from the API
   * @returns Object containing the mapping and tables
   */
  findMatchingMappingAndTables(
    fileName: string,
    mappings: CsvMapping[]
  ): {
    mapping: CsvMapping | undefined,
    primaryTable: TableConfig | undefined,
    allTables: TableConfig[]
  } {
    if (!fileName || !mappings.length) {
      return { mapping: undefined, primaryTable: undefined, allTables: [] };
    }

    // First find the matching mapping
    const matchingMapping = this.findMatchingMapping(fileName, mappings)?.mapping;

    if (!matchingMapping) {
      return { mapping: undefined, primaryTable: undefined, allTables: [] };
    }

    // Then extract the appropriate tables based on the mapping type
    if (matchingMapping.category === 'data') {
      // For data tables, return the first destination as primary and all as allTables
      const allTables = matchingMapping.destinations;
      const primaryTable = allTables.length > 0 ? allTables[0] : undefined;

      return { mapping: matchingMapping, primaryTable, allTables };
    } else {
      // For lookup tables, there's only one destination
      const primaryTable = matchingMapping.destination;

      return {
        mapping: matchingMapping,
        primaryTable,
        allTables: primaryTable ? [primaryTable] : []
      };
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

    // Get all required columns (primary keys are always required)
    const requiredColumns = table.columns.filter(col => col && col.isPrimaryKey);

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