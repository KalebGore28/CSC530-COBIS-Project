import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TableConfig, CsvMapping } from "../../types/csv-import-types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Database, Table2, CheckCircle2, Info } from "lucide-react";

interface TableSelectorProps {
  tables: TableConfig[];
  selectedTable: string;
  onTableChange: (tableId: string) => void;
  csvFile: File | null;
  isDataTable: boolean;
  mappings?: CsvMapping[];
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTable,
  onTableChange,
  csvFile,
  isDataTable,
  mappings,
}) => {
  const selectedTableData = tables.find(t => t.tableId === selectedTable);
  const isAutoDetected = csvFile && selectedTable;

  // For lookup tables only, get all possible lookup tables from the system
  const allLookupTables = !isDataTable && mappings
    ? mappings
      .filter(m => m.category === 'lookup')
      .map(m => ('destination' in m) ? m.destination : null)
      .filter((table): table is TableConfig => table !== null)
    : [];

  // Use tables directly for data tables, but use all lookup tables for selection in lookup mode
  const selectionTables = isDataTable ? tables : allLookupTables.length ? allLookupTables : tables;

  // The rest of filtering is only needed for display purposes, not for selection
  // Filter tables based on the type (data vs lookup)
  const relevantTables = isDataTable
    ? tables.filter(t => t.category === 'data')  // All data tables
    : selectionTables.filter(t => t.category === 'lookup'); // Only lookup tables

  // Check if the lookup table was auto-detected from filename
  const isLookupAutoDetected = !isDataTable && isAutoDetected && selectedTableData &&
    (selectedTableData as any)?.matchingPatterns?.some(
      (pattern: string) => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(csvFile?.name || '');
        } catch (e) {
          return false;
        }
      }
    );

  if (!tables.length) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>No tables available</AlertTitle>
        <AlertDescription>
          No {isDataTable ? "data" : "lookup"} tables are configured for import.
          Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">
          {isDataTable ? "Destination Tables" : "Select Destination Table"}
        </h3>
        {isDataTable && (
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
            <Database className="h-3 w-3 mr-1" /> Data Import
          </div>
        )}
        {!isDataTable && (
          <div className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200 flex items-center">
            <Table2 className="h-3 w-3 mr-1" /> Lookup Import
          </div>
        )}
      </div>

      {/* DATA TABLE MODE: Show info about auto-detected data tables */}
      {isDataTable && isAutoDetected && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          <div className="flex items-center text-green-800">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            <span>
              Auto-detected <span className="font-semibold">data import</span> from file <span className="font-mono text-xs bg-green-100 px-1 rounded">{csvFile.name}</span>
            </span>
          </div>
        </div>
      )}

      {/* LOOKUP TABLE MODE: Auto-detected lookup table */}
      {isLookupAutoDetected && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <div className="flex items-center text-amber-800">
            <CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" />
            <span>
              Auto-detected <span className="font-semibold">{selectedTableData?.tableName} lookup table</span> from file <span className="font-mono text-xs bg-amber-100 px-1 rounded">{csvFile.name}</span>
            </span>
          </div>
        </div>
      )}

      {/* LOOKUP TABLE MODE: Show manual selection warning */}
      {!isDataTable && !isLookupAutoDetected && csvFile && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
            <span className="text-amber-800">
              Please select the appropriate lookup table for this file. The file name <span className="font-mono text-xs bg-amber-100 px-1 rounded">{csvFile.name}</span> didn't match any known patterns.
            </span>
          </div>
        </div>
      )}

      {/* DATA TABLE MODE: Show list of destination tables */}
      {isDataTable && isAutoDetected ? (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">This data file will import to the following tables:</p>
              <ul className="list-disc pl-5 space-y-1">
                {tables.map(table => (
                  <li key={table.tableId}>
                    <span className="font-medium">{table.tableName}</span>
                    {(table as any).isPrimary && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Primary</span>
                    )}
                    {table.hasRowExpander && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Row Expander</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LOOKUP TABLE MODE: Show dropdown selector */}
          {!isDataTable && (
            <Select
              value={selectedTable}
              onValueChange={onTableChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a destination table" />
              </SelectTrigger>
              <SelectContent>
                {relevantTables
                  .sort((a, b) => a.tableName.localeCompare(b.tableName))
                  .map((table) => (
                    <SelectItem key={table.tableId} value={table.tableId}>
                      {table.tableName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {!isDataTable && !selectedTable && csvFile && (
            <div className="mt-2 text-sm text-amber-600">
              Please select a lookup table to continue
            </div>
          )}
        </>
      )}

      {selectedTable && selectedTableData && !isDataTable && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
          <span>{selectedTableData.columns.length} columns available</span>
          {selectedTableData.hasRowExpander && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Row Expander</span>
          )}
        </div>
      )}
    </div>
  );
};