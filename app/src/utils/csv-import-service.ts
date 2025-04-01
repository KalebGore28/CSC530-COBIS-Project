// csv-import-service.ts - API communication

import { TableConfig, ImportResult } from '../types/csv-import-types';

export const fetchTables = async (): Promise<TableConfig[]> => {
  try {
    const response = await fetch("/api/import/metadata", {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) throw new Error("Failed to fetch table metadata");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error fetching table metadata");
  }
};

export const parseCSV = async (file: File): Promise<{ headers: string[], data: string[][] }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/import/parse-csv", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) throw new Error("Failed to parse CSV");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error parsing CSV file");
  }
};

export const importData = async (
  tableConfig: TableConfig,
  mappedData: Record<string, string>[],
  fileName: string,
  importedBy: string
): Promise<ImportResult> => {
  try {
    const response = await fetch(`${tableConfig.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mappedData,
        fileName,
        importedBy,
      }),
    });

    if (!response.ok) throw new Error("Failed to import data");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error importing data");
  }
};

export const retryImport = async (
  endpoint: string,
  fixedData: Record<string, string>[],
  fileName: string | undefined,
  importedBy: string
): Promise<ImportResult> => {
  try {
    const response = await fetch(`${endpoint}/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fixedData,
        fileName,
        importedBy,
      }),
    });

    if (!response.ok) throw new Error("Failed to import fixed data");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error importing fixed data");
  }
};

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

    if (!response.ok) throw new Error("Failed to add lookup value");
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Error adding lookup value");
  }
};