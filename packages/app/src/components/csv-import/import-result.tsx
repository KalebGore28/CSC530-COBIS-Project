import React from "react";
import { ImportResult } from "@cobis/types";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportResultDisplayProps {
  result: ImportResult;
}

export const ImportResultDisplay: React.FC<ImportResultDisplayProps> = ({
  result,
}) => {
  if (!result) return null;

  const { tablesProcessed, rowsProcessed, batchesProcessed, rowsPerTable, errors } = result;
  const hasErrors = errors && errors.length > 0;

  return (
    <Card className="gap-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Import Summary{" "}
          {hasErrors ? (
            <AlertTriangle className="text-yellow-600" size={20} />
          ) : (
            <FileCheck className="text-green-600" size={20} />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall stats */}
        <div className="flex flex-wrap gap-4">
          <Badge variant="outline">
            Tables: <strong>{tablesProcessed.length}</strong>
          </Badge>
          <Badge variant="outline">
            Total Rows: <strong>{rowsProcessed}</strong>
          </Badge>
          <Badge variant="outline">
            Total Batches: <strong>{batchesProcessed}</strong>
          </Badge>
        </div>

        {/* Rows per table */}
        <div>
          <h3 className="font-medium mb-2">Rows per Table:</h3>
          <ul className="list-disc list-inside">
            {tablesProcessed.map((table) => (
              <li key={table}>
                <strong>{table}:</strong> {rowsPerTable[table]}
              </li>
            ))}
          </ul>
        </div>

        {/* Errors */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            <AlertDescription>
              <strong>{errors.length} error(s) occurred during import.</strong>
              <ul className="mt-2 list-disc list-inside max-h-40 overflow-auto">
                {errors.map(({ table, error }, idx) => (
                  <li key={idx}>
                    <strong>{table}</strong>: {error?.message || String(error)}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
