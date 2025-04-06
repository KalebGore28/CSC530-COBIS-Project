// ImportResult.tsx - For displaying import results
import React from "react";
import { ImportResult } from "../../types/csv-import-types";
import { Badge } from "@/components/ui/badge";
import { FileCheck } from "lucide-react";

interface ImportResultDisplayProps {
  result: ImportResult;
}

export const ImportResultDisplay: React.FC<ImportResultDisplayProps> = ({
  result
}) => {
  if (!result) return null;

  // Ensure numeric values have defaults
  const totalRecords = result.totalRecords ?? 0;
  const inserted = result.inserted ?? 0;
  const updated = result.updated ?? 0;
  const skipped = result.skipped ?? 0;
  const failed = result.failed ?? 0;

  return (
    <div className="mb-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Import Result</h3>
        <div className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center">
          <FileCheck className="h-3 w-3 mr-1" /> Successfully Imported
        </div>
      </div>

      <div className="border rounded-md p-4 w-full bg-white">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-6">
            <FileCheck className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <p className="text-slate-700 my-0 font-medium">
              Data imported successfully.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md font-normal">
              {totalRecords} total records
            </Badge>
            <Badge className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-md font-normal">
              {inserted} inserted
            </Badge>
            {updated > 0 && (
              <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1 rounded-md font-normal">
                {updated} updated
              </Badge>
            )}
            {skipped > 0 && (
              <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1 rounded-md font-normal">
                {skipped} skipped
              </Badge>
            )}
            {failed > 0 && (
              <Badge className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md font-normal">
                {failed} failed
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};