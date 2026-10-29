import React, { useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet, Info } from "lucide-react";
import type { ParseResult } from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CsvPreviewProps {
  csvData: ParseResult<Record<string, string>>;
  maxRows?: number;
  highlightSpecialValues?: boolean;
  minColumnWidth?: number;
}

// Helper types for cell value analysis
type CellType = "empty" | "null" | "text";

interface CellAnalysis {
  value: string;
  displayValue: React.ReactNode;
  type: CellType;
  isEmpty: boolean;
  className: string;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({
  csvData,
  maxRows = 5,
  highlightSpecialValues = true,
  minColumnWidth = 150, // Default minimum column width
}) => {
  const [page, setPage] = useState(0);
  const headers = Object.keys(csvData.data[0] ?? {});

  if (csvData.data.length === 0) {
    return (
      <div className="mb-6 w-full">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">CSV Preview</h3>
          <div className="flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Data Preview
          </div>
        </div>

        <Alert variant="destructive" className="mt-3 w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No data available for preview. Please upload a valid CSV file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPages = Math.ceil(csvData.data.length / maxRows);
  const pageStart = page * maxRows;
  const pageEnd = Math.min(pageStart + maxRows, csvData.data.length);
  const pageData = csvData.data.slice(pageStart, pageEnd);

  // Analyze cell types and track special values
  const specialValueTypes = {
    empty: false,
    null: false,
  };

  // Analyze a cell to determine its type and display properties
  const analyzeCell = (value: string): CellAnalysis => {
    // Handle empty values
    if (value === null || value === undefined || value === "") {
      specialValueTypes.empty = true;
      return {
        value: "",
        displayValue: <span className="text-muted-foreground italic">(empty)</span>,
        type: "empty",
        isEmpty: true,
        className: highlightSpecialValues ? "bg-amber-50 text-amber-800" : "",
      };
    }

    // Handle NULL values (case insensitive)
    if (value.toUpperCase() === "NULL") {
      specialValueTypes.null = true;
      return {
        value,
        displayValue: <span className="text-purple-700 italic">(NULL)</span>,
        type: "null",
        isEmpty: true,
        className: highlightSpecialValues ? "bg-purple-50" : "",
      };
    }

    // Standard text value
    return {
      value,
      displayValue: value,
      type: "text",
      isEmpty: false,
      className: "",
    };
  };

  // Check if there are any special values in the data
  const hasSpecialValues =
    highlightSpecialValues &&
    pageData.some((row) =>
      headers.some((key) => {
        const cellValue = row[key] || "";
        return analyzeCell(cellValue).isEmpty;
      }),
    );

  // Calculate the total width based on number of columns and minimum width
  const tableWidth = headers.length * minColumnWidth + 40; // 40px for row number column

  return (
    <div className="mb-6 w-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">CSV Preview</h3>
        <div className="border-accent bg-accent/50 flex items-center rounded-md px-2 py-1 text-xs">
          <FileSpreadsheet className="mr-1 h-3 w-3" /> Data Preview
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>{csvData.data.length} total rows</span>
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-normal text-blue-700">
            {headers.length} columns
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm">
          Showing rows {pageStart + 1}-{pageEnd}
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table
            className="w-full table-fixed"
            style={{
              width: "100%",
              minWidth: `${tableWidth}px`,
              tableLayout: "fixed",
            }}
          >
            <TableHeader className="bg-muted/30 sticky top-0">
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                {headers.map((header, index) => (
                  <TableHead
                    key={index}
                    className="font-medium"
                    style={{
                      width: `${minColumnWidth}px`,
                      minWidth: `${minColumnWidth}px`,
                    }}
                  >
                    <div className="truncate" title={header}>
                      {header}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/20">
                  <TableCell className="text-muted-foreground bg-muted/10 w-10 text-center font-mono text-sm font-medium">
                    {pageStart + rowIndex + 1}
                  </TableCell>
                  {headers.map((header, colIndex) => {
                    const cellValue = row[header] || "";
                    const cell = analyzeCell(cellValue);

                    return (
                      <TableCell
                        key={colIndex}
                        className={cn("font-mono text-sm", cell.className)}
                        style={{
                          width: `${minColumnWidth}px`,
                          minWidth: `${minColumnWidth}px`,
                        }}
                      >
                        <div className="truncate" title={cell.value}>
                          {cell.displayValue}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {hasSpecialValues && (
        <div className="mt-3 flex w-full items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="text-sm">
            <p>Special values in the preview are highlighted:</p>
            <div className="mt-1 flex flex-wrap gap-3">
              {specialValueTypes.empty && (
                <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
                  Empty cells
                </span>
              )}
              {specialValueTypes.null && (
                <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-purple-700">
                  NULL values
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex w-full items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <div className="text-muted-foreground text-sm">
            Page {page + 1} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
