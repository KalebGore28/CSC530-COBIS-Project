// CsvImport.tsx - Updated main component with simplified approach
import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "@/hooks/session-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Import types
import { TableConfig, ImportResult, ImportError } from "../types/csv-import-types";

// Import service functions
import {
  fetchTables,
  parseCSV,
  importData,
  retryImport,
  addMissingValue
} from "../utils/csv-import-service";

// Import components
import { TableSelector } from "../components/csv-import/table-selector";
import { FileUpload } from "../components/csv-import/file-upload";
import { ColumnMapper } from "../components/csv-import/column-mapper";
import { CsvPreview } from "../components/csv-import/csv-preview";
import { ImportResultDisplay } from "../components/csv-import/import-result";
import { ErrorFixingMode } from "../components/csv-import/error-fixing-mode";

// Import utilities
import { autoMapColumns, detectTableFromFilename, filePatterns } from "../utils/csv-import-utils";

export const CsvImport: React.FC = () => {
  const { session } = useSession();

  // State for tables
  const [tables, setTables] = useState<TableConfig[]>([]);

  // Selection state
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isDataTable, setIsDataTable] = useState<boolean>(false);

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Process state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Error fixing state
  const [pendingErrors, setPendingErrors] = useState<ImportError[]>([]);
  const [currentErrorIndex, setCurrentErrorIndex] = useState<number>(0);
  const [fixedData, setFixedData] = useState<Record<string, string>[]>([]);
  const [isFixMode, setIsFixMode] = useState(false);

  // Fetch table metadata on mount
  useEffect(() => {
    loadTableMetadata();
  }, []);

  const loadTableMetadata = async () => {
    try {
      const data = await fetchTables();
      console.log("Fetched table metadata:", data);
      setTables(data);
    } catch (error: any) {
      setResult({ message: error.message || "Error fetching table metadata" });
    }
  };

  // Handle file upload and parse
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File changed:", file.name);

    // Reset all state
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({});
    setResult(null);
    setPendingErrors([]);
    setFixedData([]);
    setIsFixMode(false);
    setSelectedTable("");
    setIsDataTable(false);

    // Set the new file
    setCsvFile(file);

    try {
      // Parse the CSV file
      const { headers, data } = await parseCSV(file);
      console.log("Parsed CSV headers:", headers);

      // Set headers and data
      setCsvHeaders(headers);
      setCsvData(data);

      // Check if this is a data file by looking at the file patterns
      const isDataFile = filePatterns.some(pattern => pattern.pattern.test(file.name));
      console.log("Is data file:", isDataFile);

      if (isDataFile) {
        // Only try to auto-detect for data files
        const detectedTable = detectTableFromFilename(file.name, tables);
        console.log("Detected table from filename:", detectedTable);
        setIsDataTable(true);

        if (detectedTable) {
          console.log("Auto-selected data table:", detectedTable.tableName);
          setSelectedTable(detectedTable.tableName);

          // Map columns with exact matching only
          const tableConfig = tables.find(t => t.name === detectedTable.tableName);
          if (tableConfig) {
            const newMapping = autoMapColumns(headers, tableConfig.fields);
            console.log("Auto-mapped columns:", newMapping);
            setColumnMapping(newMapping);
          }
        } else {
          console.log("No matching data table for this file pattern");
        }
      } else {
        // For lookup tables, user must select manually
        setIsDataTable(false);
        console.log("This appears to be a lookup file - manual table selection required");
      }
    } catch (error: any) {
      console.error("Error processing CSV file:", error);
      setResult({ message: error.message || "Error parsing CSV file" });
    }
  };

  // Handle clearing the file
  const handleClearFile = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setResult(null);
    setIsFixMode(false);
    setPendingErrors([]);
    setFixedData([]);
    setSelectedTable("");
    setIsDataTable(false);
  };

  // Handle table selection change
  const handleTableSelect = (tableName: string) => {
    const selectedTableConfig = tables.find(t => t.name === tableName);
    if (!selectedTableConfig) return;

    setSelectedTable(tableName);

    // Auto-map columns for the selected table using exact matching only
    if (csvHeaders.length > 0) {
      const newMapping = autoMapColumns(csvHeaders, selectedTableConfig.fields);
      console.log("Mapping for manually selected table:", newMapping);
      setColumnMapping(newMapping);
    }
  };

  // Handle column mapping change
  const handleColumnMap = (field: string, csvColumn: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: csvColumn }));
  };

  // Check if all required fields are mapped
  const allFieldsMapped = () => {
    if (!selectedTable) return false;

    const tableConfig = tables.find(t => t.name === selectedTable);
    if (!tableConfig) return false;

    return tableConfig.fields.every(field => !!columnMapping[field]);
  };

  // Handle import submission
  const handleImport = async () => {
    if (!selectedTable || !csvFile || !csvData.length) {
      setResult({ message: "Please select a table and upload a CSV file." });
      return;
    }

    const tableConfig = tables.find(t => t.name === selectedTable);
    if (!tableConfig) return;

    // Check if all fields are mapped
    if (!allFieldsMapped()) {
      setResult({ message: "Please map all required fields before importing." });
      return;
    }

    // Map CSV data to the expected format
    const mappedData = csvData.map((row) => {
      const rowData: Record<string, string> = {};
      tableConfig.fields.forEach((field) => {
        const csvColumn = columnMapping[field];
        const columnIndex = csvHeaders.indexOf(csvColumn);
        rowData[field] = columnIndex >= 0 ? row[columnIndex] || "" : "";
      });
      return rowData;
    });

    setIsLoading(true);
    try {
      const data = await importData(
        tableConfig,
        mappedData,
        csvFile.name,
        session?.user.email || session?.user.name || ''
      );

      // Handle errors that might need fixing
      if (data.errorDetails && data.errorDetails.length > 0) {
        // Foreign key errors need special handling
        const foreignKeyErrors = data.errorDetails.filter(
          err => err.errorType === "foreign_key"
        );

        if (foreignKeyErrors.length > 0) {
          setPendingErrors(foreignKeyErrors);
          setCurrentErrorIndex(0);
          setIsFixMode(true);
        }
      }

      setResult(data);
    } catch (error: any) {
      setResult({ message: error.message || "Error importing data" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding missing lookup values
  const handleAddLookupValue = async (formData: Record<string, string>) => {
    if (!pendingErrors.length) return;

    const currentError = pendingErrors[currentErrorIndex];
    if (!currentError.dependencyInfo) return;

    try {
      await addMissingValue(
        currentError.dependencyInfo.tableName,
        formData
      );

      // Add the fixed row to our fixedData array
      setFixedData(prev => [...prev, currentError.row]);

      // Move to next error
      if (currentErrorIndex < pendingErrors.length - 1) {
        setCurrentErrorIndex(prev => prev + 1);
      }
    } catch (error: any) {
      setResult({ message: error.message || "Error adding lookup value" });
    }
  };

  // Handle retry for fixed rows
  const handleRetryImport = async () => {
    if (fixedData.length === 0 || !selectedTable) return;

    const tableConfig = tables.find(t => t.name === selectedTable);
    if (!tableConfig) return;

    setIsLoading(true);
    try {
      const data = await retryImport(
        tableConfig.endpoint,
        fixedData,
        csvFile?.name,
        session?.user.email || session?.user.name || ''
      );

      // Update result with new information
      setResult(prev => {
        if (!prev) return data;

        return {
          totalRecords: (prev.totalRecords || 0),
          inserted: (prev.inserted || 0) + (data.inserted || 0),
          updated: (prev.updated || 0) + (data.updated || 0),
          skipped: (prev.skipped || 0) + (data.skipped || 0),
          skippedDetails: [...(prev.skippedDetails || []), ...(data.skippedDetails || [])],
          failed: (prev.failed || 0) - fixedData.length + (data.failed || 0),
          errorDetails: data.errorDetails || [],
        };
      });

      // Reset fix mode
      setIsFixMode(false);
      setPendingErrors([]);
      setFixedData([]);
    } catch (error: any) {
      setResult({ message: error.message || "Error importing fixed data" });
    } finally {
      setIsLoading(false);
    }
  };

  // Enable fix mode from import results
  const enableFixMode = () => {
    if (!result?.errorDetails) return;

    const foreignKeyErrors = result.errorDetails.filter(
      err => err.errorType === "foreign_key"
    );

    if (foreignKeyErrors.length > 0) {
      setPendingErrors(foreignKeyErrors);
      setCurrentErrorIndex(0);
      setIsFixMode(true);
    }
  };

  // Get the selected table config
  const selectedTableConfig = tables.find(t => t.name === selectedTable);

  return (
    <div className="p-6 flex-1 flex justify-center">
      <Card className="w-full max-w-full md:max-w-6xl flex flex-col">
        <CardHeader>
          <CardTitle className="text-3xl">CSV Import</CardTitle>
          <CardDescription>
            Import data from CSV files into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-6">
          {isFixMode ? (
            <ErrorFixingMode
              errors={pendingErrors}
              currentErrorIndex={currentErrorIndex}
              onPreviousError={() => setCurrentErrorIndex(prev => Math.max(0, prev - 1))}
              onNextError={() => setCurrentErrorIndex(prev => Math.min(pendingErrors.length - 1, prev + 1))}
              onFixedData={handleAddLookupValue}
              onRetryImport={handleRetryImport}
              fixedRowsCount={fixedData.length}
            />
          ) : (
            <>
              <FileUpload
                onFileChange={handleFileChange}
                onClearFile={handleClearFile}
                file={csvFile}
                disabled={isLoading}
              />

              {csvFile && (
                <TableSelector
                  tables={tables}
                  selectedTable={selectedTable}
                  onTableChange={handleTableSelect}
                  csvFile={csvFile}
                  isDataTable={isDataTable}
                />
              )}

              {selectedTable && csvHeaders.length > 0 && (
                <ColumnMapper
                  tableFields={selectedTableConfig?.fields || []}
                  csvHeaders={csvHeaders}
                  mapping={columnMapping}
                  onMapChange={handleColumnMap}
                />
              )}

              {csvData.length > 0 && (
                <CsvPreview
                  headers={csvHeaders}
                  data={csvData}
                  maxRows={5}
                />
              )}

              <Button
                onClick={handleImport}
                disabled={isLoading || !selectedTable || !csvFile || !allFieldsMapped()}
                className="w-full"
              >
                {isLoading ? "Importing..." : "Import CSV"}
              </Button>

              {result && (
                <ImportResultDisplay
                  result={result}
                  onFixForeignKeyErrors={enableFixMode}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};