import { useState, useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from "papaparse";

import { FileUpload } from "@/components/csv-import/file-upload";
import { TableSelector } from "@/components/csv-import/table-selector";
import { CsvPreview } from "@/components/csv-import/csv-preview";
import { ImportResultDisplay } from "@/components/csv-import/import-result";
// import { ErrorFixingMode } from "@/components/csv-import/error-fixing-mode";

// Import types
import {
  ImportInfoResponse,
  LookupCsvMapping,
  DataCsvMapping,
  ImportResult,
  // ImportError
} from "../../types/csv-import-types";
import CsvImportService from "@/services/csv-import-service";


const CsvImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importInfo, setImportInfo] = useState<ImportInfoResponse | null>(null);
  const [mapping, setMapping] = useState<DataCsvMapping | null>(null); // This is only the mapping for the data table.
  const [lookupTables, setLookupTables] = useState<LookupCsvMapping[]>([]); // This is a fallback for lookup tables if no mapping is found.

  // This value is really only needed for lookup tables, which would be passed in the final import, but its also used to show/hide the column mapper. 
  const [selectedTable, setSelectedTable] = useState<string>("");

  // State for parsed CSV data
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  // const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  // Fetch import info
  useEffect(() => {
    const fetchImportInfo = async () => {
      const info = await CsvImportService.getImportInfo();
      console.log("Import info:", info);
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
      setCsvData([]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSelectedTable("");
    setMapping(null);
    setLookupTables([]);
    setCsvData([]);
    setImportResult(null);
  };

  /**
   * Transforms PapaParse results (expecting data as string[][]) into an array of objects.
   */
  const handleParsedData = (results: Papa.ParseResult<unknown>) => {
    setCsvData(results.data as Record<string, string>[]);
  };

  const handleTableChange = (tableId: string) => {
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
            <FileUpload
              onFileChange={handleFileChange}
              onClearFile={handleClearFile}
              onParsedData={handleParsedData}
              file={selectedFile}
            />
          </div>

          <Separator />

          {/* Step 2: Preview Data */}
          {csvData.length > 0 && <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Preview Your Data</h2>
            <CsvPreview
              csvData={csvData}
              maxRows={5}
              highlightSpecialValues={true}
              minColumnWidth={150}
            />
          </div>}

          <Separator />

          {/* Step 3: Table Selector */}
          {csvData.length > 0 && <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Select The Table</h2>
            <TableSelector
              selectedTable={selectedTable}
              onTableChange={handleTableChange}
              mapping={mapping}
              lookupTables={lookupTables}
            />
          </div>}

          <Separator />

          {/* Step 4: Import Results */}
          {importResult && <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Import Results</h2>
            <ImportResultDisplay
              result={importResult}
            />
          </div>}

          {false && (
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
          {selectedTable && !importResult && (
            <div className="ml-auto">
              <Button onClick={async () => {
                if (mapping) {
                  setImportResult(await CsvImportService.processImport(csvData, undefined, mapping));
                } else {
                  setImportResult(await CsvImportService.processImport(csvData, selectedTable))
                }
              }}>
                Process Import
              </Button>
            </div>
          )}
          {importResult && (
            <div className="ml-auto">
              <Button onClick={() => {
                setImportResult(null);
                setCsvData([]);
                setSelectedFile(null);
                setSelectedTable("");
              }}>
                Start New Import
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CsvImport;