import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "@/hooks/session-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Import types
import {
  TableConfig,
  ImportResult,
  ImportError,
  FilePattern,
  ColumnValidationResult
} from "../types/csv-import-types";

// Import service functions
import {
  fetchTables,
  fetchFilePatterns,
  parseCSV,
  validateColumns,
  importCSV,
  retryImport,
  addMissingValue
} from "../utils/csv-import-service";

// Import utility functions
import {
  isDataFile,
  detectTableFromFilename,
  autoMapColumns,
  buildMappingFromValidation,
  mapCsvDataToFields
} from "../utils/csv-import-utils";

// Import components
import { TableSelector } from "../components/csv-import/table-selector";
import { FileUpload } from "../components/csv-import/file-upload";
import { ColumnMapper } from "../components/csv-import/column-mapper";
import { CsvPreview } from "../components/csv-import/csv-preview";
import { ImportResultDisplay } from "../components/csv-import/import-result";
import { ErrorFixingMode } from "../components/csv-import/error-fixing-mode";

export const CsvImport: React.FC = () => {
  const { session } = useSession();

  // State for tables and patterns
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [filePatterns, setFilePatterns] = useState<FilePattern[]>([]);
  const [lookupTables, setLookupTables] = useState<TableConfig[]>([]);
  const [dataTables, setDataTables] = useState<TableConfig[]>([]);

  // Selection state
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [isDataTable, setIsDataTable] = useState<boolean>(false);

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ColumnValidationResult | null>(null);

  // Process state
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Error fixing state
  const [pendingErrors, setPendingErrors] = useState<ImportError[]>([]);
  const [currentErrorIndex, setCurrentErrorIndex] = useState<number>(0);
  const [fixedData, setFixedData] = useState<Record<string, string>[]>([]);
  const [isFixMode, setIsFixMode] = useState(false);

  // Fetch metadata on mount
  useEffect(() => {
    loadMetadata();
  }, []);

  // Load tables and patterns metadata
  const loadMetadata = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch tables
      const tablesData = await fetchTables();
      setTables(tablesData);

      // Separate tables by category
      setLookupTables(tablesData.filter(t => t.category === 'lookup'));
      setDataTables(tablesData.filter(t => t.category === 'data'));

      // Fetch file patterns
      const patterns = await fetchFilePatterns();
      setFilePatterns(patterns);

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error loading metadata:", error);
      setError(error.message || "Error loading metadata");
      setIsLoading(false);
    }
  };

  // Handle file upload and parse
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File changed:", file.name);
    setError(null);

    // Reset all state
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({});
    setResult(null);
    setPendingErrors([]);
    setFixedData([]);
    setIsFixMode(false);
    setSelectedTable(null);
    setValidationResult(null);
    setIsDataTable(false);

    // Set the new file
    setCsvFile(file);

    try {
      setIsLoading(true);

      // Parse the CSV file client-side
      const { headers, data } = await parseCSV(file);
      console.log("Parsed CSV headers:", headers);

      // Set headers and data
      setCsvHeaders(headers);
      setCsvData(data);

      if (headers.length === 0 || data.length === 0) {
        throw new Error("CSV file appears to be empty or invalid");
      }

      // Check if this is a data file by looking at the file patterns
      const dataFileCheck = isDataFile(file.name, filePatterns);
      console.log("Is data file:", dataFileCheck);
      setIsDataTable(dataFileCheck);

      if (dataFileCheck) {
        // Try to detect the table from the filename
        const detectedTable = detectTableFromFilename(file.name, filePatterns, tables);
        console.log("Detected table from filename:", detectedTable);

        if (detectedTable) {
          setSelectedTable(detectedTable);

          // Validate columns
          await validateTableColumns(detectedTable.tableId, headers);
        } else {
          console.log("No matching data table for this file pattern");
        }
      } else {
        // For lookup tables, user must select manually
        console.log("This appears to be a lookup file - manual table selection required");
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error processing CSV file:", error);
      setError(error.message || "Error parsing CSV file");
      setCsvFile(null);
      setIsLoading(false);
    }
  };

  // Validate columns for the selected table
  const validateTableColumns = async (tableId: string, headers: string[]) => {
    try {
      const validation = await validateColumns(tableId, headers);
      console.log("Column validation result:", validation);

      setValidationResult(validation);

      // Apply suggested mapping if available
      if (validation.suggestedMapping) {
        setColumnMapping(validation.suggestedMapping);
      }

      return validation;
    } catch (error: any) {
      console.error("Error validating columns:", error);
      setError(error.message || "Error validating columns");
      return null;
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
    setSelectedTable(null);
    setValidationResult(null);
    setIsDataTable(false);
    setError(null);
  };

  // Handle table selection change
  const handleTableSelect = async (tableId: string) => {
    const selected = tables.find(t => t.tableId === tableId);
    if (!selected) return;

    setSelectedTable(selected);
    setError(null);

    // If we have CSV headers, validate the columns
    if (csvHeaders.length > 0) {
      await validateTableColumns(selected.tableId, csvHeaders);
    }
  };

  // Handle column mapping change
  const handleColumnMap = (field: string, csvColumn: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: csvColumn }));
  };

  // Check if all required fields are mapped
  const allRequiredFieldsMapped = (): boolean => {
    if (!selectedTable) return false;

    // Get all primary key fields
    const requiredFields = selectedTable.fields
      .filter(field => field.isPrimaryKey)
      .map(field => field.name);

    // Make sure each required field has a mapping that is not undefined
    return requiredFields.every(field => 
      columnMapping[field] !== undefined && 
      columnMapping[field] !== "");
  };

  // Handle import submission
  const handleImport = async () => {
    if (!selectedTable || !csvFile || !csvData.length) {
      setError("Please select a table and upload a CSV file.");
      return;
    }

    // Check if required fields are mapped
    if (!allRequiredFieldsMapped()) {
      setError("Please map all required fields before importing.");
      return;
    }

    setError(null);
    setResult(null);

    // Map CSV data to table fields
    const mappedData = mapCsvDataToFields(
      csvData,
      csvHeaders,
      columnMapping,
      selectedTable.fields.map(f => f.name)
    );

    setIsLoading(true);
    try {
      const data = await importCSV(
        csvFile,
        selectedTable.tableId,
        mappedData,
        session?.user?.email || session?.user?.name || 'system'
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
      setError(error.message || "Error importing data");
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
      setIsLoading(true);
      setError(null);
      
      await addMissingValue(
        currentError.dependencyInfo.tableName,
        formData
      );

      // Add the fixed row to our fixedData array
      setFixedData(prev => [...prev, currentError.row]);

      // Move to next error
      if (currentErrorIndex < pendingErrors.length - 1) {
        setCurrentErrorIndex(prev => prev + 1);
      } else {
        // If we're at the last error, prompt to retry import
        setResult(prev => ({
          ...prev!,
          message: `Fixed ${fixedData.length + 1} issues. Ready to retry import.`
        }));
      }
      
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message || "Error adding lookup value");
      setIsLoading(false);
    }
  };

  // Handle retry for fixed rows
  const handleRetryImport = async () => {
    if (fixedData.length === 0 || !selectedTable) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await retryImport(
        selectedTable.tableId,
        fixedData,
        csvFile?.name,
        session?.user?.email || session?.user?.name || 'system'
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
          message: `Successfully processed ${data.inserted || 0} records from fixed data.`
        };
      });

      // Reset fix mode
      setIsFixMode(false);
      setPendingErrors([]);
      setFixedData([]);
    } catch (error: any) {
      setError(error.message || "Error importing fixed data");
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Processing...</span>
            </div>
          )}
          
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
                  tables={isDataTable ? dataTables : lookupTables}
                  selectedTable={selectedTable?.tableId || ""}
                  onTableChange={handleTableSelect}
                  csvFile={csvFile}
                  isDataTable={isDataTable}
                />
              )}

              {selectedTable && csvHeaders.length > 0 && (
                <ColumnMapper
                  tableFields={selectedTable.fields}
                  csvHeaders={csvHeaders}
                  mapping={columnMapping}
                  onMapChange={handleColumnMap}
                  validationResult={validationResult}
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
                disabled={isLoading || !selectedTable || !csvFile || !allRequiredFieldsMapped()}
                className="w-full mt-4"
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