// For previewing CSV data
import React from "react";
import { PaginatedTable } from "@/components/paginated-table";

interface CsvPreviewProps {
  headers: string[];
  data: string[][];
  maxRows?: number;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({ 
  headers, 
  data,
  maxRows = 5
}) => {
  // Skip rendering if no data
  if (!headers.length || !data.length) return null;

  // Format data for PaginatedTable
  const columns = headers.map(header => ({
    key: header,
    label: header
  }));

  // Convert 2D array to array of objects
  const formattedData = data.map(row => {
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] || '';
    });
    return rowObj;
  });

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">CSV Preview</h3>
      <div className="border rounded-lg overflow-hidden">
        <PaginatedTable 
          data={formattedData} 
          columns={columns}
          rowsPerPage={maxRows}
        />
      </div>
    </div>
  );
};