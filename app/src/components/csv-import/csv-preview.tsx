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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CsvPreviewProps {
  headers: string[];
  data: string[][];
  maxRows?: number;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({
  headers,
  data,
  maxRows = 5,
}) => {
  const [page, setPage] = useState(0);

  if (!headers.length || !data.length) return null;

  const totalPages = Math.ceil(data.length / maxRows);
  const pageStart = page * maxRows;
  const pageEnd = Math.min(pageStart + maxRows, data.length);
  const pageData = data.slice(pageStart, pageEnd);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">CSV Preview</h3>
        <div className="text-sm text-gray-500">
          Showing {pageStart + 1}-{pageEnd} of {data.length} rows
        </div>
      </div>

      <div className="border rounded overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-mono text-gray-500">
                  {pageStart + rowIndex + 1}
                </TableCell>
                {headers.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[colIndex] || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="text-sm">
            Page {page + 1} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};