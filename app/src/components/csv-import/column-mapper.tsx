// ColumnMapper.tsx - Simplified version with clear required mappings
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

interface ColumnMapperProps {
  tableFields: string[];
  csvHeaders: string[];
  mapping: Record<string, string>;
  onMapChange: (field: string, csvColumn: string) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  tableFields,
  csvHeaders,
  mapping,
  onMapChange
}) => {
  // Calculate missing mappings
  const missingMappings = tableFields.filter(field => !mapping[field]);
  const hasMissingMappings = missingMappings.length > 0;

  if (!tableFields.length || !csvHeaders.length) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Map CSV Columns</h3>
        {hasMissingMappings && (
          <Badge variant="destructive">
            {missingMappings.length} unmapped field{missingMappings.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Required Field</TableHead>
              <TableHead>CSV Column</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableFields.map((field) => {
              const hasMapping = !!mapping[field];
              return (
                <TableRow key={field} className={!hasMapping ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">{field}</TableCell>
                  <TableCell>
                    <Select
                      value={mapping[field] || ""}
                      onValueChange={(value) => onMapChange(field, value)}
                    >
                      <SelectTrigger
                        className={hasMapping ? "" : "border-red-500"}
                      >
                        <SelectValue placeholder="Select a column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Select Column --</SelectItem>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {hasMapping ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Mapped
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Required
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {hasMissingMappings && (
        <p className="text-sm text-red-600 mt-2">
          Please map all required fields to continue.
        </p>
      )}
    </div>
  );
};