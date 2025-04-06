// src/utils/csv-import-service.ts
import {
  TableConfig,
  ImportResult,
  ImportInfoResponse,
  ColumnValidationResult,
  FilePattern,
  TableColumn
} from '../types/csv-import-types';

/**
 * Fetch all import information (tables, file patterns, stats)
 */
export const fetchImportInfo = async (): Promise<ImportInfoResponse> => {
  try {
    const response = await fetch("/api/import/info", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch import information");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching import information:", error);
    throw new Error(error.message || "Error fetching import information");
  }
};

/**
 * Get all tables from the import info
 */
export const fetchTables = async (): Promise<TableConfig[]> => {
  const importInfo = await fetchImportInfo();
  return importInfo.tables;
};

/**
 * Get all file patterns from the import info
 */
export const fetchFilePatterns = async (): Promise<FilePattern[]> => {
  const importInfo = await fetchImportInfo();
  return importInfo.filePatterns;
};

/**
 * Parse a CSV file to extract headers and data
 */
export const parseCSV = async (file: File): Promise<{ headers: string[], data: string[][] }> => {
  try {
    // First implementation: Use FileReader to parse locally
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          if (!event.target || !event.target.result) {
            reject(new Error("Failed to read file"));
            return;
          }

          const content = event.target.result as string;
          const lines = content.split(/\r\n|\n/);

          // Handle empty file
          if (lines.length === 0) {
            reject(new Error("Empty CSV file"));
            return;
          }

          // Parse headers
          const headers = lines[0].split(',').map(h => h.trim());

          // Parse data rows
          const data: string[][] = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue; // Skip empty lines

            const row = lines[i].split(',').map(cell => cell.trim());
            // Ensure row matches header length
            while (row.length < headers.length) row.push('');
            data.push(row);
          }

          resolve({ headers, data });
        } catch (e: any) {
          reject(new Error(`Error parsing CSV file: ${e.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  } catch (error: any) {
    console.error("Error parsing CSV:", error);
    throw new Error(error.message || "Error parsing CSV file");
  }
};

/**
 * Validate CSV headers against table columns (client-side)
 */
export const validateColumns = async (
  tableId: string,
  csvHeaders: string[],
  fileName?: string
): Promise<ColumnValidationResult> => {
  try {
    // Get all tables from the import info
    const importInfo = await fetchImportInfo();

    // Find the table we're validating against
    const table = importInfo.tables.find(t => t.tableId === tableId);

    if (!table) {
      throw new Error(`Table not found: ${tableId}`);
    }

    // Extract expected column names
    const expectedColumns = table.columns.map(col => col.csvColumn);

    // Find matching and missing columns
    const matchingColumns = csvHeaders.filter(header =>
      expectedColumns.includes(header)
    );

    const missingColumns = expectedColumns.filter(expected =>
      !csvHeaders.includes(expected)
    );

    // Find extra columns that are not expected
    const extraColumns = csvHeaders.filter(header =>
      !expectedColumns.includes(header)
    );

    // Calculate match percentage
    const matchPercentage = expectedColumns.length > 0
      ? (matchingColumns.length / expectedColumns.length) * 100
      : 0;

    // Find required columns (primary keys)
    const requiredColumns = table.columns
      .filter(col => col.isPrimaryKey || col.isRequired)
      .map(col => col.csvColumn);

    // Check if all required columns are present
    const missingRequiredColumns = requiredColumns.filter(col =>
      !matchingColumns.includes(col)
    );

    // Check if all primary keys are present
    const isPrimaryKeyValid = table.columns
      .filter(col => col.isPrimaryKey)
      .every(col => matchingColumns.includes(col.csvColumn));

    // Generate suggested mapping
    const suggestedMapping: Record<string, string> = {};

    table.columns.forEach(col => {
      if (matchingColumns.includes(col.csvColumn)) {
        // Exact match
        suggestedMapping[col.name] = col.csvColumn;
      } else {
        // Try case-insensitive match
        const caseInsensitiveMatch = csvHeaders.find(
          header => header.toLowerCase() === col.csvColumn.toLowerCase()
        );

        if (caseInsensitiveMatch) {
          suggestedMapping[col.name] = caseInsensitiveMatch;
        } else {
          // Try partial match
          const partialMatch = csvHeaders.find(
            header => header.toLowerCase().includes(col.name.toLowerCase()) ||
              col.name.toLowerCase().includes(header.toLowerCase())
          );

          if (partialMatch) {
            suggestedMapping[col.name] = partialMatch;
          } else {
            suggestedMapping[col.name] = ""; // No match found
          }
        }
      }
    });

    return {
      isValid: missingRequiredColumns.length === 0,
      tableId,
      tableName: table.tableName,
      matchingColumns,
      missingColumns,
      extraColumns,
      matchPercentage,
      isPrimaryKeyValid,
      missingRequiredColumns,
      suggestedMapping
    };
  } catch (error: any) {
    console.error("Error validating columns:", error);
    throw new Error(error.message || "Error validating columns");
  }
};

/**
 * Process and import a CSV file
 */
export const importCSV = async (
  file: File,
  tableId: string,
  mappedData: Record<string, any>[],
  importedBy: string
): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tableId", tableId);
    formData.append("importedBy", importedBy);

    // Convert mappedData to JSON and append to formData
    formData.append("mappedData", JSON.stringify(mappedData));

    const response = await fetch("/api/import/process", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to import data");
    }

    const result = await response.json();

    // Process result for UI consumption
    return processImportResult(result);
  } catch (error: any) {
    console.error("Error importing data:", error);
    throw new Error(error.message || "Error importing data");
  }
};

/**
 * Retry importing previously failed rows
 */
export const retryImport = async (
  tableId: string,
  fixedData: Record<string, string>[],
  fileName: string | undefined,
  importedBy: string
): Promise<ImportResult> => {
  try {
    const response = await fetch(`/api/import/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tableId,
        mappedData: fixedData,
        fileName,
        importedBy,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to import fixed data");
    }

    const result = await response.json();
    return processImportResult(result);
  } catch (error: any) {
    console.error("Error retrying import:", error);
    throw new Error(error.message || "Error retrying import");
  }
};

/**
 * Add a missing lookup value
 */
export const addMissingValue = async (
  tableName: string,
  data: Record<string, string>
): Promise<any> => {
  try {
    const response = await fetch(`/api/import/add-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tableName,
        data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add lookup value");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error adding lookup value:", error);
    throw new Error(error.message || "Error adding lookup value");
  }
};

/**
 * Process import result for UI display
 */
function processImportResult(result: any): ImportResult {
  // If the result is already in the right format, just return it
  if (result.fileName && (typeof result.success === 'boolean')) {
    return result;
  }

  // Otherwise, try to convert it to the expected format
  const processed: ImportResult = {
    ...result,
    fileName: result.fileName || "unknown",
    success: result.success || false,
    timestamp: result.timestamp || new Date().toISOString(),
    message: result.message || "Import completed"
  };

  // Aggregate results from multiple tables if needed
  if (result.results && Array.isArray(result.results)) {
    processed.totalRecords = result.results.reduce((sum: number, r: any) => sum + (r.totalRecords || 0), 0);
    processed.inserted = result.results.reduce((sum: number, r: any) => sum + (r.inserted || 0), 0);
    processed.updated = result.results.reduce((sum: number, r: any) => sum + (r.updated || 0), 0);
    processed.skipped = result.results.reduce((sum: number, r: any) => sum + (r.skipped || 0), 0);
    processed.failed = result.results.reduce((sum: number, r: any) => sum + (r.failed || 0), 0);
  }

  return processed;
}