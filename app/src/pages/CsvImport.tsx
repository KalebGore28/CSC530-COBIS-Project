import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import Papa from "papaparse";

// Import components
import { TableSelector } from "../components/csv-import/table-selector";
import { FileUpload } from "../components/csv-import/file-upload";
import { ColumnMapper } from "../components/csv-import/column-mapper";
import { CsvPreview } from "../components/csv-import/csv-preview";
import { ImportResultDisplay } from "../components/csv-import/import-result";
import { ErrorFixingMode } from "../components/csv-import/error-fixing-mode";

// Import service and types
import CsvImportService from "../services/csv-import-service";
import { ColumnDefinition, TableConfig, CsvMapping } from "../types/csv-import-types";

export const CsvImport: React.FC = () => {
  // State for the import flow
  const [file, setFile] = useState<File | null>(null);
  const [_, setFileName] = useState<string>("");
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [tableFields, setTableFields] = useState<ColumnDefinition[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [csvMappings, setCsvMappings] = useState<CsvMapping[]>([]);

  // Fetch table configurations on component mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const importInfo = await CsvImportService.getImportInfo();

        if (!importInfo || !importInfo.csvMappings) {
          throw new Error("Failed to load import configuration");
        }

        // Store the raw CSV mappings for use in TableSelector
        setCsvMappings(importInfo.csvMappings);

        // Extract all tables from the import info
        const allTables: TableConfig[] = [];
        importInfo.csvMappings.forEach(mapping => {
          if (mapping.category === 'data' && Array.isArray(mapping.destinations)) {
            mapping.destinations.forEach(dest => {
              allTables.push({
                ...dest,
                category: 'data',
                matchingPatterns: mapping.filePatterns || []
              });
            });
          } else if (mapping.category === 'lookup' && mapping.destination) {
            allTables.push({
              ...mapping.destination,
              category: 'lookup',
              matchingPatterns: mapping.filePatterns || []
            });
          }
        });

        setTables(allTables);
      } catch (err: any) {
        console.error("Error loading tables:", err);
        setError(`Failed to load configuration: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Handle column mapping
  const handleMapChange = (columnName: string, csvColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [columnName]: csvColumn
    }));
  };

  // Auto map columns based on CSV headers
  const autoMapColumns = (tableColumns: ColumnDefinition[], headers: string[]) => {
    const mapping: Record<string, string> = {};

    tableColumns.forEach(column => {
      // Try different matching strategies
      // 1. Direct match (case insensitive)
      let matchingHeader = headers.find(h =>
        h.toLowerCase() === column.dbColumn.toLowerCase()
      );

      // 2. Match against csvColumn property if specified
      if (!matchingHeader && column.csvColumn) {
        matchingHeader = headers.find(h =>
          h.toLowerCase() === column.csvColumn.toLowerCase()
        );
      }

      // 3. Try partial match (contains)
      if (!matchingHeader) {
        matchingHeader = headers.find(h =>
          h.toLowerCase().includes(column.dbColumn.toLowerCase()) ||
          (column.csvColumn && h.toLowerCase().includes(column.csvColumn.toLowerCase()))
        );
      }

      if (matchingHeader) {
        mapping[column.dbColumn] = matchingHeader;
      }
    });

    return mapping;
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setError(null);

    // Parse CSV file
    Papa.parse(uploadedFile, {
      complete: (results) => {
        if (results.data && Array.isArray(results.data)) {
          // Get headers from the first row
          const headers = results.data[0] as string[];

          if (!headers || headers.length === 0) {
            console.error("No headers found in CSV file");
            setError("No headers found in CSV file");
            return;
          }

          setCsvHeaders(headers);
          setCsvData(results.data as string[][]);

          // Auto-detect matching table
          const matchingTable = CsvImportService.findMatchingTable(uploadedFile.name, tables);
          if (matchingTable) {
            setSelectedTable(matchingTable);
            setTableFields(matchingTable.columns);

            // Auto-map columns using the improved function
            const autoMapping = autoMapColumns(matchingTable.columns, headers);
            setColumnMapping(autoMapping);
          }
        } else {
          setError("Failed to parse CSV file");
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setError(`Failed to parse CSV file: ${error.message}`);
      }
    });
  };

  // Clear file
  const handleClearFile = () => {
    setFile(null);
    setFileName("");
    setCsvData([]);
    setCsvHeaders([]);
    setSelectedTable(null);
    setTableFields([]);
    setColumnMapping({});
    setImportResult(null);
    setError(null);
  };

  // Handle table selection
  const handleTableChange = (tableId: string) => {
    const table = tables.find(t => t.tableId === tableId);
    if (table) {
      setSelectedTable(table);
      setTableFields(table.columns);

      // Auto-map columns if we have headers
      if (csvHeaders.length > 0) {
        const autoMapping = autoMapColumns(table.columns, csvHeaders);
        setColumnMapping(autoMapping);
      } else {
        // Reset mapping if we don't have headers
        setColumnMapping({});
      }
    }
  };

  // Check if all required fields are mapped
  const areAllRequiredFieldsMapped = () => {
    if (!selectedTable || !tableFields) return false;

    // Check if all required columns are mapped (primary keys are required)
    const requiredColumns = tableFields.filter(field =>
      field.isPrimaryKey
    );

    return requiredColumns.every(field =>
      columnMapping[field.dbColumn] && columnMapping[field.dbColumn].length > 0
    );
  };

  // Process import
  const handleProcessImport = async () => {
    if (!file || !selectedTable) {
      setError("File or table not selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the service to process the import
      const result = await CsvImportService.processImport(
        file,
        selectedTable.tableId,
        columnMapping
      );

      setImportResult(result);
    } catch (err: any) {
      console.error("Import error:", err);
      setError(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if we should show a component
  const showFileUpload = true;
  const showTableSelector = file !== null;
  const showColumnMapper = file !== null && selectedTable !== null;
  const showImportResults = importResult !== null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">CSV Data Import</CardTitle>
          <CardDescription>
            Import data from CSV files into the COBIS database
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Section */}
          {showFileUpload && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Step 1: Upload CSV File</h3>
                {file && <span className="text-sm text-green-600">✓ File uploaded</span>}
              </div>

              <FileUpload
                onFileChange={handleFileChange}
                onClearFile={handleClearFile}
                file={file}
                disabled={loading}
                allowedExtensions={[".csv"]}
                maxSizeInMB={10}
              />
            </div>
          )}

          {showFileUpload && showTableSelector && <Separator />}

          {/* Table Selection */}
          {showTableSelector && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Step 2: Select Destination Table</h3>
                {selectedTable && <span className="text-sm text-green-600">✓ Table selected</span>}
              </div>

              <TableSelector
                tables={tables}
                selectedTable={selectedTable?.tableId || ""}
                onTableChange={handleTableChange}
                csvFile={file}
                isDataTable={selectedTable?.category === 'data'}
                mappings={csvMappings}
              />
            </div>
          )}

          {showTableSelector && showColumnMapper && <Separator />}

          {/* Column Mapping */}
          {showColumnMapper && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Step 3: Map Columns</h3>
                {areAllRequiredFieldsMapped() && <span className="text-sm text-green-600">✓ All required fields mapped</span>}
              </div>

              <ColumnMapper
                tableFields={tableFields}
                csvHeaders={csvHeaders}
                mapping={columnMapping}
                onMapChange={handleMapChange}
              />
            </div>
          )}

          {file && csvHeaders.length > 0 && <Separator />}

          {/* File Preview */}
          {file && csvHeaders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">CSV Preview</h3>
              <CsvPreview
                headers={csvHeaders}
                data={csvData.slice(1)}
                maxRows={5}
                highlightSpecialValues={true}
              />
            </div>
          )}

          {showImportResults && <Separator />}

          {/* Results */}
          {showImportResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Import Results</h3>
              <ImportResultDisplay result={importResult} />

              {importResult.failed > 0 && (
                <ErrorFixingMode
                  errors={importResult.errorDetails || []}
                  onFixedData={(formData, errorKey) => {
                    console.log('Fixed data:', formData, 'for error:', errorKey);
                    // In a real application, this would update the database
                  }}
                  onRetryImport={() => {
                    // In a real application, this would retry the import with fixed data
                    console.log('Retrying import with fixed data');
                    handleProcessImport();
                  }}
                  fixedCount={0} // This would track fixed rows in a real application
                />
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end border-t p-6">
          {showImportResults ? (
            <Button onClick={handleClearFile}>
              Import Another File
            </Button>
          ) : (
            showColumnMapper && (
              <Button
                onClick={handleProcessImport}
                disabled={!areAllRequiredFieldsMapped() || loading}
              >
                {loading ? "Processing..." : "Process Import"}
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
};