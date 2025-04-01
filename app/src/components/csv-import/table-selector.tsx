// UpdatedTableSelector.tsx - Simplified table selection UI
import React from "react";
import { TableConfig } from "../../types/csv-import-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TableSelectorProps {
  tables: TableConfig[];
  selectedTable: string;
  onTableChange: (tableName: string) => void;
  csvFile: File | null;
  isDataTable: boolean;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  selectedTable,
  onTableChange,
  csvFile,
  isDataTable
}) => {
  // Separate tables by category
  const dataTables = tables;

  // Show different UI based on whether it's a data table or lookup table
  return (
    <div className="mb-6">
      {isDataTable ? (
        <>
          <label className="block mb-2 text-sm font-medium">Data Table</label>
          {selectedTable ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                <p className="text-green-800">
                  <strong>Auto-selected table:</strong> {selectedTable}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  This table was automatically selected based on the file name pattern.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                <p>No matching data table found for this file.</p>
                <p className="text-sm mt-1">
                  This file doesn't match any of the expected patterns for data import.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <>
          <label className="block mb-2 text-sm font-medium">Select Lookup Table</label>
          <Select value={selectedTable} onValueChange={onTableChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a lookup table" />
            </SelectTrigger>
            <SelectContent>
              {dataTables.map((table) => (
                <SelectItem key={table.name} value={table.name}>
                  {table.name}
                  {table.description && ` - ${table.description}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedTable && csvFile && (
            <p className="text-sm text-amber-600 mt-1">
              Please select a lookup table to continue.
            </p>
          )}
        </>
      )}
    </div>
  );
};