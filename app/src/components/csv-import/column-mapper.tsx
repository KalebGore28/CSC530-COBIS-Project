import React from "react";
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
import { TableColumn, ColumnValidationResult } from "../../types/csv-import-types";
import { autoMapColumns } from "../../utils/csv-import-utils";

interface ColumnMapperProps {
  tableFields: TableColumn[];  // Using TableColumn instead of TableField
  csvHeaders: string[];
  mapping: Record<string, string>;
  onMapChange: (columnName: string, csvColumn: string) => void;
  validationResult?: ColumnValidationResult;  // Properly typed validation result
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  tableFields,
  csvHeaders,
  mapping,
  onMapChange,
  validationResult
}) => {
  // Calculate missing required fields (primary keys or required columns)
  const missingRequiredFields = tableFields
    .filter(column => (column.isPrimaryKey || column.isRequired) && (
      mapping[column.name] === undefined ||
      mapping[column.name] === ""
    ))
    .map(column => column.name);

  const hasMissingRequired = missingRequiredFields.length > 0;

  // Handle auto-mapping columns
  const handleAutoMap = () => {
    const suggestedMapping = autoMapColumns(
      csvHeaders,
      tableFields.map(c => ({ name: c.name, csvColumn: c.csvColumn }))
    );

    // Apply each suggested mapping
    Object.entries(suggestedMapping).forEach(([columnName, csvColumn]) => {
      if (csvColumn) {
        onMapChange(columnName, csvColumn);
      }
    });
  };

  if (!tableFields.length || !csvHeaders.length) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Map CSV Columns</h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoMap}
          >
            Auto-Map Columns
          </Button>
          {hasMissingRequired && (
            <Badge variant="destructive">
              {missingRequiredFields.length} required column{missingRequiredFields.length > 1 ? 's' : ''} unmapped
            </Badge>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Table Column</TableHead>
              <TableHead className="w-1/3">CSV Column</TableHead>
              <TableHead className="w-1/3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableFields.map((column) => {
              const hasMapping = mapping[column.name] !== undefined && mapping[column.name] !== "";
              const isRequired = column.isPrimaryKey || column.isRequired;

              // Determine row status
              let rowClass = "";
              let statusVariant = "outline";
              let statusText = "Optional";

              if (isRequired && !hasMapping) {
                rowClass = "bg-red-50";
                statusVariant = "destructive";
                statusText = "Required";
              } else if (hasMapping) {
                rowClass = "bg-green-50";
                statusVariant = "outline";
                statusText = "Mapped";
                statusVariant = isRequired ? "success" : "outline";
              }

              return (
                <TableRow key={column.name} className={rowClass}>
                  <TableCell>
                    <div className="font-medium">{column.name}</div>
                    {column.isPrimaryKey && (
                      <div className="text-xs text-gray-500">Primary Key</div>
                    )}
                    {column.isRequired && !column.isPrimaryKey && (
                      <div className="text-xs text-gray-500">Required</div>
                    )}
                    {column.hasTransform && (
                      <div className="text-xs text-blue-500">Has transformation</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping[column.name] || undefined}
                      onValueChange={(value) => onMapChange(column.name, value)}
                    >
                      <SelectTrigger
                        className={(isRequired && !hasMapping) ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select a column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((header) => {
                          // Check if this header is a suggested match
                          const isSuggested = validationResult?.suggestedMapping?.[column.name] === header;
                          const isExactMatch = column.csvColumn.toLowerCase() === header.toLowerCase();
                          const isMatchingColumn = validationResult?.matchingColumns?.includes(header);

                          return (
                            <SelectItem
                              key={header}
                              value={header}
                              className={isExactMatch ? "font-bold" : ""}
                            >
                              {header}
                              {isExactMatch && " (Exact Match)"}
                              {isSuggested && !isExactMatch && " (Suggested)"}
                              {isMatchingColumn && !isExactMatch && !isSuggested && " (Matching)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {column.csvColumn && !hasMapping && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expected: {column.csvColumn}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isRequired ? (
                      <Badge variant={hasMapping ? "default" : "destructive"}>
                        {hasMapping ? "Mapped" : "Required"}
                      </Badge>
                    ) : (
                      <Badge variant={hasMapping ? "default" : "outline"} className={hasMapping ? "bg-green-50 text-green-700 border-green-200" : ""}>
                        {hasMapping ? "Mapped" : "Optional"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {hasMissingRequired && (
        <p className="text-sm text-red-600 mt-2">
          Please map all required columns to continue.
        </p>
      )}

      {tableFields.length > 0 && Object.keys(mapping).length === 0 && (
        <p className="text-sm text-amber-600 mt-2">
          Tip: Click "Auto-Map Columns" to automatically match CSV columns to table columns.
        </p>
      )}
    </div>
  );
};