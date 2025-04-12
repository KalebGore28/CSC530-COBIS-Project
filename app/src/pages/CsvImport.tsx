import { useState, useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from "papaparse";

import { FileUpload } from "@/components/features/csv-import/file-upload";
import { TableSelector } from "@/components/features/csv-import/table-selector";
import { ColumnMapper } from "@/components/features/csv-import/column-mapper";
import { CsvPreview } from "@/components/features/csv-import/csv-preview";
import { ImportResultDisplay } from "@/components/features/csv-import/import-result";
import { ErrorFixingMode } from "@/components/features/csv-import/error-fixing-mode";

// Import types
import { ImportError, ImportInfoResponse, LookupCsvMapping, DataCsvMapping } from "../types/csv-import-types";
import CsvImportService from "@/services/csv-import-service";


// Sample data for our example
const mockCsvHeaders = ["Student ID", "First Name", "Last Name", "Email", "Phone", "Department ID"];
const mockCsvData = [
  ["STU001", "John", "Doe", "john.doe@example.com", "555-1234", "DEP001"],
  ["STU002", "Jane", "Smith", "jane.smith@example.com", "555-5678", "DEP002"],
  ["STU003", "Bob", "Johnson", "bob.johnson@example.com", "555-9012", "DEP001"],
  ["STU004", "Mary", "Williams", "mary.williams@example.com", "555-3456", "DEP003"],
  ["STU005", "Mike", "Brown", "mike.brown@example.com", "555-7890", "DEP002"],
];

const CsvImport: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(true);
  const [fixedCount, setFixedCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importInfo, setImportInfo] = useState<ImportInfoResponse | null>(null);
  const [mapping, setMapping] = useState<DataCsvMapping | null>(null); // This is only the mapping for the data table.
  const [lookupTables, setLookupTables] = useState<LookupCsvMapping[]>([]); // This is a fallback for lookup tables if no mapping is found.
  // This value is really only needed for lookup tables, which would be passed in the final import, but its also used to show/hide the column mapper. 
  const [selectedTable, setSelectedTable] = useState<string>("");

  // State for parsed CSV data
  const [csvHeaders, setCsvHeaders] = useState<string[]>(mockCsvHeaders);
  const [csvData, setCsvData] = useState<string[][]>(mockCsvData);
  const [_, setIsParsed] = useState<boolean>(false);

  // Fetch import info
  useEffect(() => {
    const fetchImportInfo = async () => {
      const info = await CsvImportService.getImportInfo();
      setImportInfo(info);
    };
    fetchImportInfo();
  }, []);

  // This is the main effect that runs when the import info is fetched and a file is selected.
  useEffect(() => {
    if (importInfo && selectedFile) {
      const { mapping } = CsvImportService.findMatchingMappingAndTables(selectedFile.name, importInfo.csvMappings);
      const lookupTables = CsvImportService.getLookupTables(importInfo.csvMappings);

      setMapping(mapping || null);
      setLookupTables(lookupTables);

      // Set default selected table based on the mapping
      if (mapping) {
        if (mapping.destinations.length > 0) {
          setSelectedTable(mapping.destinations[0].tableId);
        }
      } else {
        setSelectedTable("");
      }
    }
  }, [importInfo, selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    // Reset parsed data if file changes
    if (!file) {
      setCsvHeaders(mockCsvHeaders);
      setCsvData(mockCsvData);
      setIsParsed(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSelectedTable("");
    setMapping(null);
    setLookupTables([]);
    setCsvHeaders(mockCsvHeaders);
    setCsvData(mockCsvData);
    setIsParsed(false);
  };

  const handleParsedData = (results: Papa.ParseResult<unknown>) => {
    if (results.data && results.data.length > 0) {
      // Extract headers from the parse result
      if (results.meta.fields && results.meta.fields.length > 0) {
        setCsvHeaders(results.meta.fields);
      }

      // Extract data rows
      const dataRows: string[][] = [];
      results.data.forEach((row: any) => {
        if (typeof row === 'object' && row !== null) {
          const rowValues = Object.values(row).map(val =>
            val !== null && val !== undefined ? String(val) : "");
          dataRows.push(rowValues);
        }
      });

      setCsvData(dataRows);
      setIsParsed(true);
      console.log('CSV parsed successfully:', results);
    }
  };

  const handleTableChange = (tableId: string) => {
    console.log("Table selected:", tableId);
    setSelectedTable(tableId);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">CSV Import</CardTitle>
          <CardDescription>
            Import data from CSV files into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">

          {/* Step 1: File Upload and Table Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 1: Select Table and Upload CSV</h2>
            <div className="grid gap-6">
              <FileUpload
                onFileChange={handleFileChange}
                onClearFile={handleClearFile}
                onParsedData={handleParsedData}
                file={selectedFile}
              />
              {selectedFile && <TableSelector
                selectedTable={selectedTable}
                onTableChange={handleTableChange}
                mapping={mapping}
                lookupTables={lookupTables}
              />}
            </div>
          </div>

          <Separator />

          {/* Step 2: Column Mapping */}
          {selectedTable && <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Map CSV Columns to Database Fields</h2>
            <ColumnMapper
              csvColumns={csvHeaders}
              lookupTables={lookupTables}
              selectedTable={selectedTable} // Used only when it is a lookup table so it can filter the lookup tables passed in.
              mapping={mapping} // This is the mapping for the data table.
              onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
            />
          </div>}

          <Separator />

          {/* Step 3: Preview Data */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Preview Your Data</h2>
            <CsvPreview
              headers={csvHeaders}
              data={csvData}
              maxRows={5}
              highlightSpecialValues={true}
            />
          </div>

          <Separator />

          {/* Step 4: Import Results */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Import Results</h2>
            <ImportResultDisplay
              result={{
                success: true,
                totalRecords: 5,
                inserted: 3,
                updated: 0,
                skipped: 2,
                failed: 0
              }}
            />
          </div>

          {!showSuccess && (
            <>
              <Separator />

              {/* Step 5: Error Fixing (Only shown when there are errors) */}
              {/* <div>
                <h2 className="text-xl font-bold mb-4">Step 5: Fix Import Errors</h2>
                <ErrorFixingMode
                  errors={mockImportErrors}
                  onFixedData={(data, key) => {
                    console.log("Fixed data:", data, "Key:", key);
                    setFixedCount(prev => prev + 1);
                  }}
                  onRetryImport={() => setShowSuccess(true)}
                  fixedCount={fixedCount}
                />
              </div> */}
            </>
          )}
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CsvImport;