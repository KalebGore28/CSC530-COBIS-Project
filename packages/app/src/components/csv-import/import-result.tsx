// ImportResult.tsx - For displaying import results
import React from "react";
import { ImportResult } from "../../types/csv-import-types";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportResultDisplayProps {
  result: ImportResult;
}

export const ImportResultDisplay: React.FC<ImportResultDisplayProps> = ({
  result
}) => {
  if (!result) return null;

  // Ensure numeric values have defaults
  const totalRecords = result.results[0].totalRecords ?? 0;
  const inserted = result.results[0].inserted ?? 0;
  const updated = result.results[0].updated ?? 0;
  const skipped = result.results[0].skipped ?? 0;
  const failed = result.results[0].failed ?? 0;

  // Determine if this is a completely failed import
  const isCompleteFailure =
    (!result.success && failed === totalRecords) ||
    (totalRecords === 0 && !result.success);

  // For an error message with no data
  if (totalRecords === 0 && !result.success) {
    return (
      <div className="mb-6 w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Import Result</h3>
          <div className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> Import Failed
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p>{result.results[0].failed}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Determine if this is a partially successful import with errors (not just skips)
  const hasErrors = failed > 0;

  return (
    <div className="mb-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Import Result</h3>
        <div className={`px-2 py-1 ${isCompleteFailure
          ? 'bg-red-50 text-red-700 border-red-200'
          : hasErrors
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-green-50 text-green-700 border-green-200'
          } text-xs rounded-md border flex items-center`}>
          {isCompleteFailure ? (
            <><AlertCircle className="h-3 w-3 mr-1" /> Import Failed</>
          ) : hasErrors ? (
            <><AlertTriangle className="h-3 w-3 mr-1" /> Completed with Errors</>
          ) : (
            <><FileCheck className="h-3 w-3 mr-1" /> Successfully Imported</>
          )}
        </div>
      </div>

      <div className="border rounded-md p-4 w-full bg-white">
        <div className="flex items-center flex-wrap">
          <div className="flex items-center mr-6">
            {isCompleteFailure ? (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            ) : hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
            ) : (
              <FileCheck className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            )}
            <p className="text-slate-700 my-0 font-medium">
              {isCompleteFailure
                ? "Import failed. No data was imported."
                : hasErrors
                  ? "Data import completed with errors."
                  : "Data imported successfully."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md font-normal">
              {totalRecords} total records
            </Badge>
            {inserted > 0 && (
              <Badge className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-md font-normal">
                {inserted} inserted
              </Badge>
            )}
            {updated > 0 && (
              <Badge className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1 rounded-md font-normal">
                {updated} updated
              </Badge>
            )}
            {skipped > 0 && (
              <Badge className="bg-blue-50/50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md font-normal">
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