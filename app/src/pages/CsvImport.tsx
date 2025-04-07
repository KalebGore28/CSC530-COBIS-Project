import { useState, useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { FileUpload } from "@/components/csv-import/file-upload";
import { TableSelector } from "@/components/csv-import/table-selector";
import { ColumnMapper } from "@/components/csv-import/column-mapper";
import { CsvPreview } from "@/components/csv-import/csv-preview";
import { ImportResultDisplay } from "@/components/csv-import/import-result";
import { ErrorFixingMode } from "@/components/csv-import/error-fixing-mode";

// Import types
import { TableConfig, ImportError, ImportInfoResponse, CsvMapping } from "../types/csv-import-types";
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

const mockTableConfig: TableConfig[] = [
  {
    tableId: "students",
    tableName: "Students",
    category: "data",
    primaryKeys: ["studentId"],
    hasRowExpander: false,
    columns: [
      { dbColumn: "studentId", csvColumn: "Student ID", isPrimaryKey: true, hasTransform: false },
      { dbColumn: "firstName", csvColumn: "First Name", isPrimaryKey: false, hasTransform: false },
      { dbColumn: "lastName", csvColumn: "Last Name", isPrimaryKey: false, hasTransform: false },
      { dbColumn: "email", csvColumn: "Email", isPrimaryKey: false, hasTransform: false },
      { dbColumn: "phone", csvColumn: "Phone", isPrimaryKey: false, hasTransform: false },
      { dbColumn: "departmentId", csvColumn: "Department ID", isPrimaryKey: false, hasTransform: false },
    ],
  },
  {
    tableId: "departments",
    tableName: "Departments",
    category: "lookup",
    primaryKeys: ["departmentId"],
    hasRowExpander: false,
    columns: [
      { dbColumn: "departmentId", csvColumn: "Department ID", isPrimaryKey: true, hasTransform: false },
      { dbColumn: "departmentName", csvColumn: "Department Name", isPrimaryKey: false, hasTransform: false },
      { dbColumn: "building", csvColumn: "Building", isPrimaryKey: false, hasTransform: false },
    ],
  }
];

const mockImportErrors: ImportError[] = [
  {
    row: {
      "studentId": "STU004",
      "firstName": "Mary",
      "lastName": "Williams",
      "email": "mary.williams@example.com",
      "phone": "555-3456",
      "departmentId": "DEP003"
    },
    error: "Foreign key constraint violation on departmentId",
    errorType: "foreign_key",
    dependencyInfo: {
      tableName: "Departments",
      columns: ["departmentId", "departmentName"],
      values: {
        "departmentId": "DEP003"
      }
    }
  },
  {
    row: {
      "studentId": "STU005",
      "firstName": "Mike",
      "lastName": "Brown",
      "email": "mike.brown@example.com",
      "phone": "555-7890",
      "departmentId": "DEP003"
    },
    error: "Foreign key constraint violation on departmentId",
    errorType: "foreign_key",
    dependencyInfo: {
      tableName: "Departments",
      columns: ["departmentId", "departmentName"],
      values: {
        "departmentId": "DEP003"
      }
    }
  }
];

export const CsvImport: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(true);
  const [fixedCount, setFixedCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importInfo, setImportInfo] = useState<ImportInfoResponse | null>(null);
  const [mapping, setMapping] = useState<CsvMapping | null>(null);

  // Fetch import info
  useEffect(() => {
    const fetchImportInfo = async () => {
      const info = await CsvImportService.getImportInfo();
      setImportInfo(info);
    };
    fetchImportInfo();
  }, []);


  useEffect(() => {
    if (importInfo && selectedFile) {
      const { mapping } = CsvImportService.findMatchingMappingAndTables(selectedFile.name, importInfo.csvMappings);
      setMapping(mapping || null);
    }
  }, [importInfo, selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
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
                file={selectedFile}
              />
              {selectedFile && <TableSelector
                selectedTable="students"
                onTableChange={(id) => console.log("Selected table:", id)}
                mapping={mapping}
              />}
            </div>
          </div>

          <Separator />

          {/* Step 2: Column Mapping */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Map CSV Columns to Database Fields</h2>
            <ColumnMapper
              tableFields={mockTableConfig[0].columns}
              csvHeaders={mockCsvHeaders}
              mapping={{
                "studentId": "Student ID",
                "firstName": "First Name",
                "lastName": "Last Name",
                "email": "Email",
                "phone": "Phone",
                "departmentId": "Department ID"
              }}
              onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
            />
          </div>

          <Separator />

          {/* Step 3: Preview Data */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Preview Your Data</h2>
            <CsvPreview
              headers={mockCsvHeaders}
              data={mockCsvData}
              maxRows={5}
              highlightSpecialValues={true}
            />
          </div>

          <Separator />

          {/* Step 4: Import Results */}
          <div>
            <h2 className="text-xl font-bold mb-4">Step 4: Import Results</h2>
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuccess(!showSuccess)}
                className="mb-4"
              >
                {showSuccess ? "Show Error Result" : "Show Success Result"}
              </Button>
            </div>

            {showSuccess ? (
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
            ) : (
              <ImportResultDisplay
                result={{
                  success: false,
                  totalRecords: 5,
                  inserted: 3,
                  updated: 0,
                  skipped: 0,
                  failed: 2
                }}
              />
            )}
          </div>

          {!showSuccess && (
            <>
              <Separator />

              {/* Step 5: Error Fixing (Only shown when there are errors) */}
              <div>
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
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setFixedCount(0);
              setShowSuccess(true);
            }}
          >
            Reset Demo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};