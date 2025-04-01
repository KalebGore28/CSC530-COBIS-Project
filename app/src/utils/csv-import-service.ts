// src/utils/csv-import-service.ts
import {
  TableConfig,
  ImportResult,
  ImportPatternsResponse,
  ImportTablesResponse,
  ColumnValidationResult,
  FilePattern
} from '../types/csv-import-types';

/**
 * Fetch all available file patterns for data tables
 */
export const fetchFilePatterns = async (): Promise<FilePattern[]> => {
  try {
    const response = await fetch("/api/import/patterns", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch file patterns");
    }

    const data: ImportPatternsResponse = await response.json();
    return data.patterns;
  } catch (error: any) {
    console.error("Error fetching file patterns:", error);
    throw new Error(error.message || "Error fetching file patterns");
  }
};

/**
 * Fetch all available tables for import
 */
export const fetchTables = async (): Promise<TableConfig[]> => {
  try {
    const response = await fetch("/api/import/tables", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch tables");
    }

    const data: ImportTablesResponse = await response.json();
    return data.tables;
  } catch (error: any) {
    console.error("Error fetching tables:", error);
    throw new Error(error.message || "Error fetching tables");
  }
};

/**
 * Get lookup tables only
 */
export const fetchLookupTables = async (): Promise<TableConfig[]> => {
  try {
    const response = await fetch("/api/import/tables", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch lookup tables");
    }

    const data: ImportTablesResponse = await response.json();
    return data.lookupTables;
  } catch (error: any) {
    console.error("Error fetching lookup tables:", error);
    throw new Error(error.message || "Error fetching lookup tables");
  }
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
 * Validate column mappings for a specific table
 */
export const validateColumns = async (
  tableId: string,
  csvHeaders: string[]
): Promise<ColumnValidationResult> => {
  try {
    const response = await fetch("/api/import/validate-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tableId,
        csvHeaders
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to validate columns");
    }

    return await response.json();
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
    const response = await fetch(`/api/import/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        tableId,
        fixedData,
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
        data,
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
 * Normalize import result for UI consumption
 */
function processImportResult(result: any): ImportResult {
  // If the result already has flattened properties, return as-is
  if (result.totalRecords !== undefined) {
    return result;
  }

  // Extract summary stats from results
  const processed: ImportResult = {
    ...result,
    totalRecords: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errorDetails: [],
    skippedDetails: [],
  };

  // Sum up totals from all result tables
  if (result.results && Array.isArray(result.results)) {
    result.results.forEach((tableResult: any) => {
      processed.totalRecords += tableResult.totalRecords || 0;
      processed.inserted += tableResult.inserted || 0;
      processed.updated += tableResult.updated || 0;
      processed.skipped += tableResult.skipped || 0;
      processed.failed += tableResult.failed || 0;

      // Collect all error details
      if (tableResult.errorDetails && Array.isArray(tableResult.errorDetails)) {
        processed.errorDetails?.push(...tableResult.errorDetails);
      }

      // Collect all skipped details
      if (tableResult.skippedDetails && Array.isArray(tableResult.skippedDetails)) {
        processed.skippedDetails?.push(...tableResult.skippedDetails);
      }
    });
  }

  return processed;
}