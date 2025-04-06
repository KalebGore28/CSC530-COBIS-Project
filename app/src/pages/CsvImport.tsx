import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Import types
import { TableConfig, ImportError } from "../types/csv-import-types";

// Import components
import { TableSelector } from "../components/csv-import/table-selector";
import { FileUpload } from "../components/csv-import/file-upload";
import { ColumnMapper } from "../components/csv-import/column-mapper";
import { CsvPreview } from "../components/csv-import/csv-preview";
import { ImportResultDisplay } from "../components/csv-import/import-result";
import { ErrorFixingMode } from "../components/csv-import/error-fixing-mode";

export const CsvImport: React.FC = () => {
  // Mock data for component previews
  const mockTableConfig: TableConfig[] = [
    {
      tableId: "students",
      tableName: "Students",
      category: "data",
      primaryKeys: ["studentId"],
      hasRowExpander: false,
      matchingPatterns: ["students\\.csv", "student_data\\.csv"],
      columns: [
        { name: "studentId", csvColumn: "Student ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
        { name: "firstName", csvColumn: "First Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "lastName", csvColumn: "Last Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "email", csvColumn: "Email", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "dateOfBirth", csvColumn: "Date of Birth", isPrimaryKey: false, isRequired: true, hasTransform: false },
      ],
    },
    {
      tableId: "courses",
      tableName: "Courses",
      category: "data",
      primaryKeys: ["courseId"],
      hasRowExpander: false,
      matchingPatterns: ["courses\\.csv", "course_data\\.csv"],
      columns: [
        { name: "courseId", csvColumn: "Course ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
        { name: "courseName", csvColumn: "Course Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "department", csvColumn: "Department", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "credits", csvColumn: "Credits", isPrimaryKey: false, isRequired: true, hasTransform: false },
      ],
    },
    {
      tableId: "student-courses",
      tableName: "Student Courses",
      category: "data",
      primaryKeys: ["studentId", "courseId", "term"],
      hasRowExpander: false,
      matchingPatterns: ["student_courses\\.csv", "enrollments\\.csv"],
      columns: [
        { name: "studentId", csvColumn: "Student ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
        { name: "courseId", csvColumn: "Course ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
        { name: "term", csvColumn: "Term", isPrimaryKey: true, isRequired: true, hasTransform: false },
        { name: "grade", csvColumn: "Grade", isPrimaryKey: false, isRequired: true, hasTransform: false },
        { name: "status", csvColumn: "Status", isPrimaryKey: false, isRequired: true, hasTransform: false },
      ],
    }
  ];

  const mockCsvHeaders = ["Student ID", "First Name", "Last Name", "Email", "Phone", "Date of Birth"];
  const mockCsvData = [
    ["STU001", "John", "Doe", "john.doe@example.com", "555-1234", "2000-01-01"],
    ["STU002", "Jane", "Smith", "jane.smith@example.com", "555-5678", "2001-02-02"],
    ["STU003", "Bob", "Johnson", "bob.johnson@example.com", "555-9012", "1999-03-03"],
    ["STU004", "Mary", "Williams", "mary.williams@example.com", "555-3456", "2002-04-04"],
    ["STU005", "Mike", "Brown", "mike.brown@example.com", "555-7890", "2001-05-05"],
  ];

  // Mock import errors for error fixing mode
  const mockImportErrors: ImportError[] = [
    {
      row: {
        "studentId": "STU006",
        "firstName": "Alex",
        "lastName": "Garcia",
        "email": "alex.garcia@example.com",
        "departmentId": "DEP001"
      },
      error: "Foreign key constraint violation on departmentId",
      errorType: "foreign_key",
      dependencyInfo: {
        tableName: "Departments",
        columns: ["departmentId", "departmentName"],
        values: {
          "departmentId": "DEP001"
        }
      }
    },
    {
      row: {
        "studentId": "STU007",
        "firstName": "Sarah",
        "lastName": "Lee",
        "email": "sarah.lee@example.com",
        "majorId": "MAJ001"
      },
      error: "Foreign key constraint violation on majorId",
      errorType: "foreign_key",
      dependencyInfo: {
        tableName: "Majors",
        columns: ["majorId", "majorName"],
        values: {
          "majorId": "MAJ001"
        }
      }
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">CSV Import</CardTitle>
          <CardDescription>
            Import data from CSV files into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Component Preview Mode</h2>
            <p className="text-amber-700">
              This page displays all individual components of the CSV import interface for development and testing purposes.
              Each component is rendered with mock data to demonstrate its functionality.
              We'll use these components to build the complete CSV import interface.
            </p>
          </div>
          <div className="space-y-12 py-4">
            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Table Selector Component (Data Table)</h3>
              <TableSelector
                tables={mockTableConfig}
                selectedTable="students"
                onTableChange={(id) => console.log("Selected table:", id)}
                csvFile={new File([""], "students.csv")}
                isDataTable={true}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Table Selector Component (Lookup Table)</h3>
              <TableSelector
                tables={[
                  {
                    tableId: "departments",
                    tableName: "Departments",
                    category: "lookup",
                    primaryKeys: ["departmentId"],
                    hasRowExpander: false,
                    matchingPatterns: ["departments\\.csv"],
                    columns: [
                      { name: "departmentId", csvColumn: "Department ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
                      { name: "departmentName", csvColumn: "Department Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
                      { name: "building", csvColumn: "Building", isPrimaryKey: false, isRequired: false, hasTransform: false },
                    ],
                  },
                  {
                    tableId: "majors",
                    tableName: "Majors",
                    category: "lookup",
                    primaryKeys: ["majorId"],
                    hasRowExpander: false,
                    matchingPatterns: ["majors\\.csv"],
                    columns: [
                      { name: "majorId", csvColumn: "Major ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
                      { name: "majorName", csvColumn: "Major Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
                      { name: "departmentId", csvColumn: "Department ID", isPrimaryKey: false, isRequired: true, hasTransform: false },
                    ],
                  }
                ]}
                selectedTable="departments"
                onTableChange={(id) => console.log("Selected lookup table:", id)}
                csvFile={new File([""], "departments.csv")}
                isDataTable={false}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Table Selector Component (Lookup Table - No Auto-detection)</h3>
              <TableSelector
                tables={[
                  {
                    tableId: "departments",
                    tableName: "Departments",
                    category: "lookup",
                    primaryKeys: ["departmentId"],
                    hasRowExpander: false,
                    matchingPatterns: ["departments\\.csv"],
                    columns: [
                      { name: "departmentId", csvColumn: "Department ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
                      { name: "departmentName", csvColumn: "Department Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
                      { name: "building", csvColumn: "Building", isPrimaryKey: false, isRequired: false, hasTransform: false },
                    ],
                  },
                  {
                    tableId: "majors",
                    tableName: "Majors",
                    category: "lookup",
                    primaryKeys: ["majorId"],
                    hasRowExpander: false,
                    matchingPatterns: ["majors\\.csv"],
                    columns: [
                      { name: "majorId", csvColumn: "Major ID", isPrimaryKey: true, isRequired: true, hasTransform: false },
                      { name: "majorName", csvColumn: "Major Name", isPrimaryKey: false, isRequired: true, hasTransform: false },
                      { name: "departmentId", csvColumn: "Department ID", isPrimaryKey: false, isRequired: true, hasTransform: false },
                    ],
                  }
                ]}
                selectedTable=""
                onTableChange={(id) => console.log("Selected lookup table:", id)}
                csvFile={new File([""], "generic_lookup_data.csv")}
                isDataTable={false}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">File Upload Component</h3>

              <div className="space-y-8">
                {/* Default state - with file */}
                <div>
                  <h4 className="text-md font-semibold mb-2">With Valid File</h4>
                  <FileUpload
                    onFileChange={(_) => console.log("File changed")}
                    onClearFile={() => console.log("File cleared")}
                    file={new File([""], "students.csv", { type: "text/csv", lastModified: Date.now() })}
                    disabled={false}
                  />
                </div>

                {/* No file selected state */}
                <div>
                  <h4 className="text-md font-semibold mb-2">No File Selected</h4>
                  <FileUpload
                    onFileChange={(_) => console.log("File changed")}
                    onClearFile={() => console.log("File cleared")}
                    file={null}
                    disabled={false}
                  />
                </div>

                {/* Invalid file state */}
                <div>
                  <h4 className="text-md font-semibold mb-2">With Invalid File</h4>
                  <FileUpload
                    onFileChange={(_) => console.log("File changed")}
                    onClearFile={() => console.log("File cleared")}
                    file={new File([""], "document.pdf", { type: "application/pdf", lastModified: Date.now() })}
                    disabled={false}
                  />
                </div>

                {/* Disabled state */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Disabled State</h4>
                  <FileUpload
                    onFileChange={(_) => console.log("File changed")}
                    onClearFile={() => console.log("File cleared")}
                    file={null}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Column Mapper Component</h3>

              <div className="space-y-8">
                {/* Complete Mapping Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Complete Mapping Example</h4>
                  <ColumnMapper
                    tableFields={mockTableConfig[0].columns}
                    csvHeaders={mockCsvHeaders}
                    mapping={{
                      "studentId": "Student ID",
                      "firstName": "First Name",
                      "lastName": "Last Name",
                      "email": "Email",
                      "dateOfBirth": "Date of Birth"
                    }}
                    onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
                  />
                </div>

                {/* Composite Key Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Composite Key Example</h4>
                  <ColumnMapper
                    tableFields={mockTableConfig[2].columns}
                    csvHeaders={["Student ID", "Course ID", "Term", "Grade", "Status", "Notes"]}
                    mapping={{
                      "studentId": "Student ID",
                      "courseId": "Course ID",
                      "term": "Term",
                      "grade": "Grade",
                      "status": "Status"
                    }}
                    onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
                  />
                </div>

                {/* Partial Mapping Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Partial Mapping Example (Missing Required Columns)</h4>
                  <ColumnMapper
                    tableFields={mockTableConfig[0].columns}
                    csvHeaders={mockCsvHeaders}
                    mapping={{
                      "firstName": "First Name",
                      "lastName": "Last Name",
                      "email": "Email"
                    }}
                    onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
                  />
                </div>

                {/* No Mapping Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">No Mapping Example</h4>
                  <ColumnMapper
                    tableFields={mockTableConfig[0].columns}
                    csvHeaders={mockCsvHeaders}
                    mapping={{}}
                    onMapChange={(col, csvCol) => console.log(`Mapped ${col} to ${csvCol}`)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">CSV Preview Component</h3>

              <div className="space-y-8">
                {/* Normal Data Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Standard CSV Data</h4>
                  <CsvPreview
                    headers={mockCsvHeaders}
                    data={mockCsvData}
                    maxRows={2}
                  />
                </div>

                {/* Data with Special Values */}
                <div>
                  <h4 className="text-md font-semibold mb-2">CSV Data with Empty/NULL Values</h4>
                  <CsvPreview
                    headers={mockCsvHeaders}
                    data={[
                      ["STU001", "John", "Doe", "john.doe@example.com", "", "2000-01-01"],
                      ["STU002", "Jane", "Smith", "NULL", "555-5678", "2001-02-02"],
                      ["STU003", "", "Johnson", "bob.johnson@example.com", "555-9012", "1999-03-03"],
                      ["STU004", "Mary", "Williams", "mary.williams@example.com", "555-3456", "NULL"],
                      ["", "Anonymous", "User", "anonymous@example.com", "555-7890", "2001-05-05"],
                    ]}
                    maxRows={2}
                    highlightSpecialValues={true}
                  />
                </div>

                {/* Empty Data Example */}
                <div>
                  <h4 className="text-md font-semibold mb-2">No Data Available</h4>
                  <CsvPreview
                    headers={[]}
                    data={[]}
                    maxRows={5}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Import Result Component</h3>

              <div className="space-y-8">
                {/* Successful import */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Successful Import</h4>
                  <ImportResultDisplay
                    result={{
                      success: true,
                      totalRecords: 5,
                      inserted: 3,
                      updated: 1,
                      skipped: 1,
                      failed: 0
                    }}
                  />
                </div>

                {/* Import with only insertions */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Insert-Only Import</h4>
                  <ImportResultDisplay
                    result={{
                      success: true,
                      totalRecords: 5,
                      inserted: 5,
                      updated: 0,
                      skipped: 0,
                      failed: 0
                    }}
                  />
                </div>

                {/* Import with updates */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Update-Heavy Import</h4>
                  <ImportResultDisplay
                    result={{
                      success: true,
                      totalRecords: 5,
                      inserted: 1,
                      updated: 4,
                      skipped: 0,
                      failed: 0
                    }}
                  />
                </div>

                {/* Import with skipped rows */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Import with Skipped Rows</h4>
                  <ImportResultDisplay
                    result={{
                      success: true,
                      totalRecords: 10,
                      inserted: 3,
                      updated: 2,
                      skipped: 5,
                      failed: 0
                    }}
                  />
                </div>

                {/* Import with some errors */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Import with Errors</h4>
                  <ImportResultDisplay
                    result={{
                      success: false,
                      totalRecords: 12,
                      inserted: 3,
                      updated: 2,
                      skipped: 1,
                      failed: 6
                    }}
                  />
                </div>

                {/* Completely failed import */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Completely Failed Import</h4>
                  <ImportResultDisplay
                    result={{
                      success: false,
                      totalRecords: 12,
                      inserted: 0,
                      updated: 0,
                      skipped: 0,
                      failed: 12
                    }}
                  />
                </div>

                {/* Failed import with error message */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Critical Error Import</h4>
                  <ImportResultDisplay
                    result={{
                      success: false,
                      message: "Import failed due to invalid data format. Please check your CSV file and try again.",
                      totalRecords: 0,
                      inserted: 0,
                      updated: 0,
                      skipped: 0,
                      failed: 0
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 pb-2 border-b">Error Fixing Mode Component</h3>
              <ErrorFixingMode
                errors={mockImportErrors}
                currentErrorIndex={0}
                onPreviousError={() => console.log("Previous error")}
                onNextError={() => console.log("Next error")}
                onFixedData={(data) => console.log("Fixed data:", data)}
                onRetryImport={() => console.log("Retry import")}
                fixedRowsCount={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};