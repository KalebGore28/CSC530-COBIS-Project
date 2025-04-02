import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableConfig } from "../../types/csv-import-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Table2 } from "lucide-react";

interface TableSelectorProps {
  tables: TableConfig[];
  selectedTable: string;
  onTableChange: (tableId: string) => void;
  csvFile: File | null;
  isDataTable: boolean;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTable,
  onTableChange,
  csvFile,
  isDataTable,
}) => {
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
        <h3 className="text-sm font-medium">Select Destination Table</h3>
        {isDataTable && selectedTable && (
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
            <Database className="h-3 w-3 mr-1" /> Data Table
          </div>
        )}
        {!isDataTable && (
          <div className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200 flex items-center">
            <Table2 className="h-3 w-3 mr-1" /> Lookup Table
          </div>
        )}
      </div>

      {isDataTable && csvFile && selectedTable && (
        <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
          <AlertTitle className="text-blue-800 flex items-center">
            <Database className="h-4 w-4 mr-2" /> Detected Table
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Based on the filename <strong>"{csvFile.name}"</strong>, we've automatically
            selected the <strong>{tables.find(t => t.tableId === selectedTable)?.tableName}</strong> table.
          </AlertDescription>
        </Alert>
      )}

      <Select
        value={selectedTable}
        onValueChange={onTableChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a destination table" />
        </SelectTrigger>
        <SelectContent>
          {/* Removed empty value item */}
          {tables
            .sort((a, b) => a.tableName.localeCompare(b.tableName))
            .map((table) => (
              <SelectItem key={table.tableId} value={table.tableId}>
                {table.tableName}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedTable && (
        <div className="mt-2 text-sm text-muted-foreground">
          {tables.find(t => t.tableId === selectedTable)?.fields.length || 0} fields available
        </div>
      )}
    </div>
  );
};