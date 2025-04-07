import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { ColumnDefinition, TableConfig } from "../../types/csv-import-types";
import { AlertCircle, CheckCircle2, Columns, Key, Hash, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Define validation result interface
interface ColumnValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface ColumnMapperProps {
  tableFields: ColumnDefinition[];
  csvHeaders: string[];
  mapping: Record<string, string>;
  onMapChange: (columnName: string, csvColumn: string) => void;
  validationResult?: ColumnValidationResult;
  isDataImport?: boolean;
  allTables?: TableConfig[];
  selectedTable?: TableConfig;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  tableFields,
  csvHeaders,
  mapping,
  onMapChange,
  isDataImport = false,
  allTables = [],
  selectedTable,
}) => {
  // Track the active table for the tabs
  const [activeTable, setActiveTable] = useState<string>(selectedTable?.tableId || '');

  // If this is a data import with multiple tables, we want to show tabs
  const isMultiTable = isDataImport && allTables.length > 1;

  // Get the current table fields based on the active tab
  const currentTableFields = useMemo(() => {
    if (!isMultiTable) return tableFields;

    const currentTable = allTables.find(t => t.tableId === activeTable);
    return currentTable?.columns || tableFields;
  }, [isMultiTable, tableFields, allTables, activeTable]);

  // Count all unmapped columns (all columns are required)
  const unmappedColumns = currentTableFields
    .filter(column => !mapping[column.dbColumn])
    .map(column => column.dbColumn);

  // Count primary key columns separately (for special indication, not for "optional" logic)
  const primaryKeyColumns = currentTableFields
    .filter(column => column.isPrimaryKey)
    .map(column => column.dbColumn);

  const hasUnmappedColumns = unmappedColumns.length > 0;

  // Count mapped columns
  const mappedColumnsCount = Object.values(mapping).filter(Boolean).length;

  // Determine if we have a composite key
  const primaryKeyCount = useMemo(() => {
    return currentTableFields.filter(column => column.isPrimaryKey).length;
  }, [currentTableFields]);

  const hasCompositeKey = primaryKeyCount > 1;

  if (!tableFields.length || !csvHeaders.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Map CSV Columns</h3>
        <div className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-200 flex items-center">
          <Columns className="h-3 w-3 mr-1" /> Column Mapping
        </div>
      </div>

      {isMultiTable ? (
        <Tabs
          defaultValue={activeTable}
          value={activeTable}
          onValueChange={setActiveTable}
          className="mb-4"
        >
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              This file will import to multiple tables. Select a table to map its columns.
            </p>
          </div>
          <TabsList className="w-full">
            {allTables.map(table => (
              <TabsTrigger
                key={table.tableId}
                value={table.tableId}
                className="flex-1"
              >
                {table.tableName}
                {table.hasRowExpander && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Row Expander</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {allTables.map(table => (
            <TabsContent key={table.tableId} value={table.tableId}>
              <ColumnMappingTable
                tableFields={table.columns}
                csvHeaders={csvHeaders}
                mapping={mapping}
                onMapChange={onMapChange}
                hasCompositeKey={table.columns.filter(c => c.isPrimaryKey).length > 1}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {mappedColumnsCount} of {currentTableFields.length} columns mapped
            </div>
            {hasUnmappedColumns ? (
              <Badge variant="outline" className="font-normal bg-amber-50 text-amber-700 border-amber-200">
                {unmappedColumns.length} unmapped
              </Badge>
            ) : (
              <Badge variant="outline" className="font-normal bg-green-50 text-green-700 border-green-200">
                All columns mapped
              </Badge>
            )}
          </div>
          <ColumnMappingTable
            tableFields={currentTableFields}
            csvHeaders={csvHeaders}
            mapping={mapping}
            onMapChange={onMapChange}
            hasCompositeKey={hasCompositeKey}
          />
        </div>
      )}

      {hasUnmappedColumns && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>All columns must be mapped to proceed.</strong> {unmappedColumns.length} column(s) are still unmapped.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Extract the table component to avoid duplication
const ColumnMappingTable: React.FC<{
  tableFields: ColumnDefinition[];
  csvHeaders: string[];
  mapping: Record<string, string>;
  onMapChange: (columnName: string, csvColumn: string) => void;
  hasCompositeKey: boolean;
}> = ({ tableFields, csvHeaders, mapping, onMapChange, hasCompositeKey }) => {
  return (
    <div className="max-h-96 overflow-y-auto rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0">
          <TableRow>
            <TableHead className="w-2/5">Table Column</TableHead>
            <TableHead className="w-2/5">CSV Column</TableHead>
            <TableHead className="w-1/5">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableFields.map((column) => {
            const hasMapping = mapping[column.dbColumn] !== undefined && mapping[column.dbColumn] !== "";
            const isMapped = hasMapping;

            return (
              <TableRow
                key={column.dbColumn}
                className={cn(
                  "group transition-colors",
                  !isMapped ? "bg-red-50/50" : "bg-green-50/50"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {column.isPrimaryKey ? (
                      <Key className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <Hash className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <div className="font-medium">{column.dbColumn}</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-5 mt-0.5">
                    {column.isPrimaryKey && (hasCompositeKey ? "Composite Key" : "Primary Key")}
                    {column.hasTransform && (
                      <span className={cn("text-blue-500", column.isPrimaryKey ? "ml-2" : "")}>
                        {column.isPrimaryKey ? "• " : ""}Has transformation
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping[column.dbColumn] || "none"}
                    onValueChange={(value) => onMapChange(column.dbColumn, value === "none" ? "" : value)}
                  >
                    <SelectTrigger
                      className={cn(
                        "border-input",
                        !isMapped ? "border-red-300 ring-red-200" : "border-green-300 ring-green-200"
                      )}
                    >
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- None --</SelectItem>
                      {csvHeaders.map((header) => {
                        // Check if this header is a suggested match
                        const isExactMatch =
                          header.toLowerCase() === column.dbColumn.toLowerCase() ||
                          (column.csvColumn && header.toLowerCase() === column.csvColumn.toLowerCase());

                        // Also check partial matches to be consistent with auto-mapper
                        const isPartialMatch =
                          !isExactMatch && (
                            header.toLowerCase().includes(column.dbColumn.toLowerCase()) ||
                            (column.csvColumn && header.toLowerCase().includes(column.csvColumn.toLowerCase())) ||
                            (column.csvColumn && column.csvColumn.toLowerCase().includes(header.toLowerCase()))
                          );

                        return (
                          <SelectItem
                            key={header}
                            value={header}
                            className={cn(
                              isExactMatch && "font-semibold text-green-700 bg-green-50",
                              isPartialMatch && "bg-yellow-50"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              {header}
                              {isExactMatch && (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                                  <CheckCircle2 className="mr-0.5 h-3 w-3" />
                                  Exact Match
                                </span>
                              )}
                              {isPartialMatch && (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                                  <Info className="mr-0.5 h-3 w-3" />
                                  Partial Match
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {column.csvColumn && !isMapped && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Info className="h-3 w-3 mr-1.5" />
                      Expected: <span className="font-mono ml-1 text-xs bg-muted px-1 rounded">{column.csvColumn}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isMapped ? "outline" : "destructive"}
                    className={isMapped ? "bg-green-50 text-green-700 border-green-200" : ""}
                  >
                    {isMapped ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Mapped
                      </span>
                    ) : "Not Mapped"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};