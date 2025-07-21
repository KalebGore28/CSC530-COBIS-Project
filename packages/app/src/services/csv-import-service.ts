import axios from 'axios';

import type {
  DataCsvMapping,
  LookupCsvMapping,
  BaseDestination
} from '@cobis/types';

// Doing type gymnastics to ensure the types are the expected return types
export type SchemaRefMetadata = {
  name?: string;
  columns: {
    name: string;
    type: string;
    notNull: boolean;
    length?: number;
    isPrimaryKey: boolean;
    isUnique: boolean;
  }[];
  primaryKey: string[];
  foreignKeys: {
    columns: string[];
    foreignTable: string;
    foreignColumns: string[];
    onDelete: string;
    onUpdate: string;
  }[];
};

type DestinationWithMetadata = Omit<BaseDestination, 'schemaRef'> & {
  schemaRef: SchemaRefMetadata;
};

export type DataCsvMappingWithMetadata = Omit<DataCsvMapping, 'destinations'> & {
  destinations: DestinationWithMetadata[];
};

export type LookupCsvMappingWithMetadata = Omit<LookupCsvMapping, 'destination'> & {
  destination: DestinationWithMetadata;
};

export type CSVFileMappingWithMetadata =
  | DataCsvMappingWithMetadata
  | LookupCsvMappingWithMetadata;

/**
 * Process a CSV import
 * @param csvData The CSV data to import
 * @param tableId The ID of the table to import into
 * @param columnMapping Optional column mapping override
 */
export async function processImport(
  csvData: Record<string, string>[],
  tableId?: string,
  columnMapping?: DataCsvMapping
): Promise<ImportResult> {
  try {
    const response = await axios.post('/api/import/process', {
      csvData,
      tableId,
      columnMapping
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error processing import:', error);
    throw error;
  }
}

export async function getMappingByName(mappingName: string): Promise<CSVFileMappingWithMetadata> {
  try {
    const response = await axios.post('/api/import/get-mapping-by-name', {
      mappingName
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data.result as CSVFileMappingWithMetadata;
  } catch (error) {
    console.error('Error getting mapping by name:', error);
    throw error;
  }
}

export async function getMappingByFilePattern(fileName: string): Promise<CSVFileMappingWithMetadata> {
  try {
    const response = await axios.post('/api/import/get-mapping-by-file-pattern', {
      fileName
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data.result as CSVFileMappingWithMetadata;
  } catch (error) {
    console.error('Error getting mapping by file pattern:', error);
    throw error;
  }
}

export async function getAllLookupMappingNames(): Promise<string[]> {
  try {
    const response = await axios.post('/api/import/get-all-lookup-mapping-names', {}, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data.result;
  } catch (error) {
    console.error('Error getting all lookup mapping names:', error);
    throw error;
  }
}