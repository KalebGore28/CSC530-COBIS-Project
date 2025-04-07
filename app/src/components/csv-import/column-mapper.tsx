import React, { useMemo } from "react";
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
import { ColumnDefinition } from "../../types/csv-import-types";
import { AlertCircle, CheckCircle2, Columns, Key, Hash, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  tableFields,
  csvHeaders,
  mapping,
  onMapChange,
}) => {
  // Count all unmapped columns (all columns are required)
  const unmappedColumns = tableFields
    .filter(column => !mapping[column.dbColumn])
    .map(column => column.dbColumn);

  const hasUnmappedColumns = unmappedColumns.length > 0;

  // Count mapped columns
  const mappedColumnsCount = Object.values(mapping).filter(Boolean).length;

  // Determine if we have a composite key
  const primaryKeyCount = useMemo(() => {
    return tableFields.filter(column => column.isPrimaryKey).length;
  }, [tableFields]);

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

      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {mappedColumnsCount} of {tableFields.length} columns mapped
          </div>
          {hasUnmappedColumns && (
            <Badge variant="destructive" className="font-normal">
              {unmappedColumns.length} unmapped
            </Badge>
          )}
        </div>
      </div>

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

                          return (
                            <SelectItem
                              key={header}
                              value={header}
                              className={cn(
                                isExactMatch && "font-semibold text-green-700 bg-green-50"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {header}
                                {isExactMatch && (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                                    <CheckCircle2 className="mr-0.5 h-3 w-3" />
                                    Match
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

      {hasUnmappedColumns && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All columns must be mapped to proceed. {unmappedColumns.length} column(s) still need mapping.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};