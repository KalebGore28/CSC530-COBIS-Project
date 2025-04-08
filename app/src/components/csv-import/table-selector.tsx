import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CsvMapping, LookupCsvMapping } from "../../types/csv-import-types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Database, Table2, Info } from "lucide-react";

interface TableSelectorProps {
  mapping: CsvMapping | null; // Used only for data tables
  lookupTables: LookupCsvMapping[]; // Used only for lookup tables when no mapping is found.
  selectedTable: string;
  onTableChange: (tableId: string) => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  mapping,
  lookupTables,
  selectedTable,
  onTableChange,
}) => {

  // If no mapping but lookup tables are available, show lookup table selector
  if (!mapping && lookupTables.length > 0) {
    // Find the selected lookup table for display in the dropdown
    const selectedLookupTable = lookupTables.find(
      table => table.destination.tableId === selectedTable
    );

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">
            Select Lookup Table
          </h3>
          <div className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200 flex items-center">
            <Table2 className="h-3 w-3 mr-1" /> Lookup Import
          </div>
        </div>
        <div className="p-3 bg-amber-50 rounded-md border border-amber-200 mb-4">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
            <div className="text-sm text-amber-800">
              <p>No matching table found for this file. You can use it as a lookup table import.</p>
            </div>
          </div>
        </div>
        <Select
          value={selectedTable}
          onValueChange={onTableChange}
          defaultValue={lookupTables.length > 0 ? lookupTables[0].destination.tableId : undefined}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a lookup table">
              {selectedLookupTable?.destination.tableName || "Select a lookup table"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {lookupTables.map(lookupTable => (
              <SelectItem
                key={lookupTable.destination.tableId}
                value={lookupTable.destination.tableId}
              >
                {lookupTable.destination.tableName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (!mapping) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>No mapping available</AlertTitle>
        <AlertDescription>
          Please upload a valid CSV file to see available tables.
        </AlertDescription>
      </Alert>
    );
  }

  const isDataTable = mapping.category === 'data';

  // For data tables, use the destinations array
  const tables = isDataTable && 'destinations' in mapping ? mapping.destinations : [];


  // For data tables, show the destination table(s)
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

      {isDataTable && (
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
      )}
    </div>
  );
};