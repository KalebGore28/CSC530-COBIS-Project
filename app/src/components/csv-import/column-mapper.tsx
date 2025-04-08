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
import { ColumnDefinition, TableConfig, LookupCsvMapping, DataCsvMapping } from "../../types/csv-import-types";
import { AlertCircle, CheckCircle2, Columns, Key, Hash, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ColumnMapperProps {
  lookupTables: LookupCsvMapping[];
  selectedTable?: string;
  mapping: DataCsvMapping | null;
  onMapChange: (columnName: string, csvColumn: string) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  lookupTables,
  selectedTable,
  mapping,
  onMapChange,
}) => {
  // Get available CSV columns from the mapping
  const getAvailableCsvColumns = (mapping: DataCsvMapping | null, destination?: TableConfig) => {
    if (!mapping) return [];

    // Extract unique CSV columns from all destinations or the specific destination
    const allColumns: string[] = [];

    if (destination) {
      // If a specific destination is provided, only use its columns
      destination.columns.forEach(column => {
        if (column.csvColumn && column.csvColumn.trim() !== "" && !allColumns.includes(column.csvColumn)) {
          allColumns.push(column.csvColumn);
        }
      });
    } else {
      // Otherwise, collect from all destinations
      mapping.destinations.forEach(dest => {
        dest.columns.forEach(column => {
          if (column.csvColumn && column.csvColumn.trim() !== "" && !allColumns.includes(column.csvColumn)) {
            allColumns.push(column.csvColumn);
          }
        });
      });
    }

    return allColumns.filter(Boolean);
  };

  // Component to render a single table mapping
  const TableMapping = ({
    tableName,
    columns,
    availableCsvColumns
  }: {
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
              <TableRow key={`${tableName}-${column.dbColumn}-${Math.random().toString(36).substring(2, 7)}`}>
                <TableCell className="font-medium flex items-center gap-2">
                  {column.isPrimaryKey && <Key className="h-4 w-4 text-amber-500" />}
                  {column.dbColumn}
                </TableCell>
                <TableCell>
                  <Select
                    value={column.csvColumn || ""}
                    onValueChange={(value) => onMapChange(column.dbColumn, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableCsvColumns
                        .filter(csvCol => csvCol && csvCol.trim() !== "") // Filter out empty values
                        .map((csvCol) => (
                          <SelectItem key={`option-${csvCol}`} value={csvCol}>
                            {csvCol}
                          </SelectItem>
                        ))}
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
                      <span className="text-xs text-amber-500">Not mapped</span>
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

  if (mapping) {
    // Data table mapping logic
    const tablesWithMappings = useMemo(() => {
      return mapping.destinations.map((destination) => {
        const tableName = destination.tableName;
        const availableCsvColumns = getAvailableCsvColumns(mapping, destination);

        // Auto-match columns that have the same name (case insensitive)
        const columns = destination.columns.map((column) => {
          // Find if there's any CSV column that matches the DB column name
          const matchedCsvColumn = availableCsvColumns.find(
            (csvCol) => csvCol.toLowerCase() === column.dbColumn.toLowerCase()
          );

          // Use existing mapping or auto-match or empty string
          return {
            ...column,
            csvColumn: column.csvColumn || matchedCsvColumn || ""
          };
        });

        return {
          tableName,
          columns,
          availableCsvColumns
        };
      });
    }, [mapping]);

    // For multiple destinations, create tabs
    if (tablesWithMappings.length > 1) {
      return (
        <div className="space-y-4">
          <Tabs defaultValue={tablesWithMappings[0].tableName}>
            <TabsList className="mb-4">
              {tablesWithMappings.map((table) => (
                <TabsTrigger key={table.tableName} value={table.tableName}>
                  {table.tableName}
                </TabsTrigger>
              ))}
            </TabsList>

            {tablesWithMappings.map((table) => (
              <TabsContent key={table.tableName} value={table.tableName}>
                <TableMapping
                  tableName={table.tableName}
                  columns={table.columns}
                  availableCsvColumns={table.availableCsvColumns}
                />
              </TabsContent>
            ))}
          </Tabs>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              All required columns must be mapped before proceeding. Primary key columns (
              <Key className="h-3 w-3 inline mx-1" />) are essential for matching records.
            </AlertDescription>
          </Alert>
        </div>
      );
    } else if (tablesWithMappings.length === 1) {
      // Single destination, no tabs needed
      const table = tablesWithMappings[0];
      return (
        <div className="space-y-4">
          <TableMapping
            tableName={table.tableName}
            columns={table.columns}
            availableCsvColumns={table.availableCsvColumns}
          />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              All required columns must be mapped before proceeding. Primary key columns (
              <Key className="h-3 w-3 inline mx-1" />) are essential for matching records.
            </AlertDescription>
          </Alert>
        </div>
      );
    } else {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No table destinations found.</p>
        </div>
      );
    }
  } else if (selectedTable) {
    // Lookup table mapping logic
    const lookupMapping = lookupTables.find(
      (table) => table.destination.tableId === selectedTable
    );

    if (lookupMapping) {
      // Get all available CSV columns from the lookup table
      const availableCsvColumns = lookupMapping.destination.columns
        .map(col => col.csvColumn)
        .filter(Boolean) as string[];

      return (
        <div className="space-y-4">
          <TableMapping
            tableName={lookupMapping.destination.tableName}
            columns={lookupMapping.destination.columns}
            availableCsvColumns={availableCsvColumns}
          />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Lookup tables help associate data from your CSV with existing database records.
            </AlertDescription>
          </Alert>
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