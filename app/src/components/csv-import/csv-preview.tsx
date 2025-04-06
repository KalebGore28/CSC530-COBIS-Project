import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileSpreadsheet, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CsvPreviewProps {
  headers: string[];
  data: string[][];
  maxRows?: number;
  highlightSpecialValues?: boolean;
}

// Helper types for cell value analysis
type CellType = 'empty' | 'null' | 'text';

interface CellAnalysis {
  value: string;
  displayValue: React.ReactNode;
  type: CellType;
  isEmpty: boolean;
  className: string;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({
  headers,
  data,
  maxRows = 5,
  highlightSpecialValues = true,
}) => {
  const [page, setPage] = useState(0);

  if (!headers.length || !data.length) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">CSV Preview</h3>
          <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
            <FileSpreadsheet className="h-3 w-3 mr-1" /> Data Preview
          </div>
        </div>

        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No data available for preview. Please upload a valid CSV file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / maxRows);
  const pageStart = page * maxRows;
  const pageEnd = Math.min(pageStart + maxRows, data.length);
  const pageData = data.slice(pageStart, pageEnd);

  // Analyze cell types and track special values
  const specialValueTypes = {
    empty: false,
    null: false
  };

  // Analyze a cell to determine its type and display properties
  const analyzeCell = (value: string): CellAnalysis => {
    // Handle empty values
    if (value === null || value === undefined || value === "") {
      specialValueTypes.empty = true;
      return {
        value: "",
        displayValue: <span className="italic text-muted-foreground">(empty)</span>,
        type: 'empty',
        isEmpty: true,
        className: highlightSpecialValues ? "bg-amber-50 text-amber-800" : ""
      };
    }

    // Handle NULL values (case insensitive)
    if (value.toUpperCase() === "NULL") {
      specialValueTypes.null = true;
      return {
        value,
        displayValue: <span className="italic text-purple-700">(NULL)</span>,
        type: 'null',
        isEmpty: true,
        className: highlightSpecialValues ? "bg-purple-50" : ""
      };
    }

    // Standard text value
    return {
      value,
      displayValue: value,
      type: 'text',
      isEmpty: false,
      className: ""
    };
  };

  // Check if there are any special values in the data
  const hasSpecialValues =
    highlightSpecialValues &&
    pageData.some(row =>
      row.some(cell => {
        if (!cell || cell === "") return true;
        if (typeof cell === 'string' && cell.toUpperCase() === "NULL") return true;
        return false;
      })
    );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">CSV Preview</h3>
        <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 flex items-center">
          <FileSpreadsheet className="h-3 w-3 mr-1" /> Data Preview
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>{data.length} total rows</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
            {headers.length} columns
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing rows {pageStart + 1}-{pageEnd}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className="font-medium min-w-[120px]"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/20">
                <TableCell className="font-mono text-center text-muted-foreground bg-muted/10 font-medium text-sm">
                  {pageStart + rowIndex + 1}
                </TableCell>
                {headers.map((_, colIndex) => {
                  const cellValue = row[colIndex] || "";
                  const cell = analyzeCell(cellValue);

                  return (
                    <TableCell
                      key={colIndex}
                      className={cn(
                        "font-mono text-sm truncate max-w-xs",
                        cell.className
                      )}
                    >
                      {cell.displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasSpecialValues && (
        <div className="flex items-start gap-2 mt-3 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p>Special values in the preview are highlighted:</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {specialValueTypes.empty && (
                <span className="bg-amber-50 px-2 py-0.5 rounded text-amber-800 border border-amber-200">Empty cells</span>
              )}
              {specialValueTypes.null && (
                <span className="bg-purple-50 px-2 py-0.5 rounded text-purple-700 border border-purple-200">NULL values</span>
              )}
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <div className="text-sm text-muted-foreground">
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