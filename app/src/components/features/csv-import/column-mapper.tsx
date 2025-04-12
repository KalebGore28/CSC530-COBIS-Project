import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDefinition, LookupCsvMapping, DataCsvMapping, CsvMapping } from "../../../types/csv-import-types";
import { AlertCircle, CheckCircle2, Columns, Key, Hash, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColumnMapperProps {
  lookupTables: LookupCsvMapping[];
  selectedTable?: string;
  mapping: DataCsvMapping | null;
  onFinishedMapping: (mappings: CsvMapping[]) => void;
  csvColumns: string[];
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  lookupTables,
  selectedTable,
  mapping,
  onFinishedMapping,
  csvColumns = []
}) => {
  // State to track the current mappings for each table
  const [tableMappings, setTableMappings] = useState<CsvMapping[]>([]);
  // State to track validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Initialize table mappings when component receives props
  useEffect(() => {
    if (mapping) {
      // Initialize from data mapping
      const initialMappings = mapping.destinations.map(destination => {
        return {
          tableId: destination.tableId,
          tableName: destination.tableName,
          columns: destination.columns.map(column => {
            // Auto-match columns with the same name (case insensitive)
            const matchedCsvColumn = !column.csvColumn ?
              csvColumns.find(csvCol => csvCol.toLowerCase() === column.dbColumn.toLowerCase()) :
              column.csvColumn;

            return {
              ...column,
              csvColumn: column.csvColumn || matchedCsvColumn || ""
            };
          })
        };
      });
      setTableMappings(initialMappings);
    } else if (selectedTable) {
      // Initialize from lookup table
      const lookupMapping = lookupTables.find(
        table => table.destination.tableId === selectedTable
      );

      if (lookupMapping) {
        const initialMapping = {
          tableId: lookupMapping.destination.tableId,
          tableName: lookupMapping.destination.tableName,
          columns: lookupMapping.destination.columns.map(column => {
            // Auto-match columns with the same name
            const matchedCsvColumn = !column.csvColumn ?
              csvColumns.find(csvCol => csvCol.toLowerCase() === column.dbColumn.toLowerCase()) :
              column.csvColumn;

            return {
              ...column,
              csvColumn: column.csvColumn || matchedCsvColumn || ""
            };
          })
        };
        setTableMappings([initialMapping]);
      }
    }
  }, [mapping, selectedTable, lookupTables, csvColumns]);

  // Handle column selection change
  const handleColumnChange = (tableId: string, dbColumn: string, csvColumn: string) => {
    setTableMappings(prevMappings =>
      prevMappings.map(table => {
        if (table.tableId === tableId) {
          return {
            ...table,
            columns: table.columns.map(column => {
              if (column.dbColumn === dbColumn) {
                return {
                  ...column,
                  csvColumn: csvColumn === "---" ? "" : csvColumn
                };
              }
              return column;
            })
          };
        }
        return table;
      })
    );
  };

  // Validate mappings and check if ready to submit
  const validateMappings = () => {
    const errors: Record<string, string[]> = {};

    tableMappings.forEach(table => {
      const tableErrors: string[] = [];

      // Check required columns (primary keys or columns marked as required)
      table.columns.forEach(column => {
        if ((column.isPrimaryKey || column.isRequired) && !column.csvColumn) {
          tableErrors.push(`${column.dbColumn} is required but not mapped.`);
        }
      });

      if (tableErrors.length > 0) {
        errors[table.tableId] = tableErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if all required columns are mapped
  const isReadyToSubmit = useMemo(() => {
    return tableMappings.every(table =>
      table.columns.every(column =>
        !(column.isPrimaryKey || column.isRequired) || column.csvColumn
      )
    );
  }, [tableMappings]);

  // Submit mappings automatically when ready or when mappings change
  useEffect(() => {
    validateMappings(); // Always update validation errors

    if (tableMappings.length > 0 && isReadyToSubmit) {
      onFinishedMapping(tableMappings);
    }
  }, [tableMappings, isReadyToSubmit, onFinishedMapping]);

  // Component to render a single table mapping
  const TableMapping = ({
    tableId,
    tableName,
    columns,
    availableCsvColumns
  }: {
    tableId: string;
    tableName: string;
    columns: ColumnDefinition[];
    availableCsvColumns: string[]
  }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Columns className="h-5 w-5" />
            {tableName}
          </h3>
          <Badge variant="outline" className="font-normal">
            {columns.length} columns
          </Badge>
        </div>

        {validationErrors[tableId] && validationErrors[tableId].length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors[tableId].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Database Column</TableHead>
              <TableHead>CSV Column</TableHead>
              <TableHead className="w-[100px] text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={`${tableName}-${column.dbColumn}`}>
                <TableCell className="font-medium flex items-center gap-2">
                  {column.isPrimaryKey && <Key className="h-4 w-4 text-amber-500" />}
                  {column.dbColumn}
                  {column.isRequired && !column.isPrimaryKey && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={column.csvColumn || "---"}
                    onValueChange={(value) => handleColumnChange(tableId, column.dbColumn, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select column">
                        {column.csvColumn || "Select column"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="---">---</SelectItem>
                      {availableCsvColumns && availableCsvColumns.length > 0 ? (
                        availableCsvColumns
                          .filter(csvCol => csvCol && csvCol.trim() !== "") // Filter out empty values
                          .map((csvCol) => (
                            <SelectItem key={csvCol} value={csvCol}>
                              {csvCol}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-columns" disabled>No columns available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  {column.csvColumn ? (
                    <div className="flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">Mapped</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-amber-500">
                        {column.isPrimaryKey || column.isRequired ? "Required" : "Not mapped"}
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (tableMappings.length > 0) {
    // For multiple tables, create tabs
    if (tableMappings.length > 1) {
      return (
        <div className="space-y-4">
          <Tabs defaultValue={tableMappings[0].tableId}>
            <TabsList className="mb-4">
              {tableMappings.map((table) => (
                <TabsTrigger key={table.tableId} value={table.tableId}>
                  {table.tableName}
                </TabsTrigger>
              ))}
            </TabsList>

            {tableMappings.map((table) => (
              <TabsContent key={table.tableId} value={table.tableId}>
                <TableMapping
                  tableId={table.tableId}
                  tableName={table.tableName}
                  columns={table.columns}
                  availableCsvColumns={csvColumns}
                />
              </TabsContent>
            ))}
          </Tabs>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center flex-wrap">
              <span>All required columns must be mapped before proceeding. Primary key columns</span>
              <Key className="h-3 w-3 mx-1 flex-shrink-0" />
              <span>are essential for matching records.</span>
            </AlertDescription>
          </Alert>

          {!isReadyToSubmit && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please map all required columns to continue.
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    } else if (tableMappings.length === 1) {
      // Single table, no tabs needed
      const table = tableMappings[0];
      return (
        <div className="space-y-4">
          <TableMapping
            tableId={table.tableId}
            tableName={table.tableName}
            columns={table.columns}
            availableCsvColumns={csvColumns}
          />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center flex-wrap">
              <span>All required columns must be mapped before proceeding. Primary key columns</span>
              <Key className="h-3 w-3 mx-1 flex-shrink-0" />
              <span>are essential for matching records.</span>
            </AlertDescription>
          </Alert>

          {!isReadyToSubmit && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please map all required columns to continue.
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }
  }

  return (
    <div className="p-8 text-center border rounded-md">
      <Hash className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-medium">No mapping found for this table.</p>
      <p className="text-muted-foreground mt-1">
        Please select a valid table or check your mapping configuration.
      </p>
    </div>
  );
};