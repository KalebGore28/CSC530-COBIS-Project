// ImportResult.tsx - For displaying import results
import React from "react";
import { ImportResult, ImportError } from "../../types/csv-import-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { PaginatedTable } from "@/components/paginated-table";

interface ImportResultDisplayProps {
  result: ImportResult;
  onFixForeignKeyErrors: () => void;
}

export const ImportResultDisplay: React.FC<ImportResultDisplayProps> = ({
  result,
  onFixForeignKeyErrors
}) => {
  if (!result) return null;

  console.log("Import result:", result);

  // Check if we have foreign key errors
  const hasForeignKeyErrors = result.errorDetails?.some(err => err.errorType === "foreign_key") || false;

  // Format error data for the table
  const formatErrorsForTable = (errors: ImportError[]) => {
    return errors.map(err => ({
      errorType: err.errorType,
      error: err.error,
      details: err.dependencyInfo
        ? `Missing value in "${err.dependencyInfo.tableName}"`
        : ''
    }));
  };

  // If we have error details, prepare them for display
  const errorTableData = result.errorDetails ? formatErrorsForTable(result.errorDetails) : [];
  const errorColumns = [
    { key: 'errorType', label: 'Type' },
    { key: 'error', label: 'Error' },
    { key: 'details', label: 'Details' }
  ];

  // Ensure numeric values have defaults
  const totalRecords = result.totalRecords ?? 0;
  const inserted = result.inserted ?? 0;
  const updated = result.updated ?? 0;
  const skipped = result.skipped ?? 0;
  const failed = result.failed ?? 0;

  // For an error message with no data
  if (result.message && !totalRecords && !result.success) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <p>{result.message}</p>
        </AlertDescription>
      </Alert>
    );
  }

  // For an informational message with no data
  if (result.message && !totalRecords && result.success) {
    return (
      <Alert>
        <AlertDescription>
          <p>{result.message}</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-6">
      <Alert
        variant={failed > 0 ? "destructive" : "default"}
      >
        <AlertDescription>
          {failed > 0 ? (
            <p className="font-semibold mb-2">Data import completed with errors.</p>
          ) : (
            <p className="font-semibold mb-2">Data imported successfully.</p>
          )}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>Total Records: <span className="font-medium">{totalRecords}</span></div>
            <div>Inserted: <span className="font-medium">{inserted}</span></div>
            <div>Updated: <span className="font-medium">{updated}</span></div>
            <div>Skipped: <span className="font-medium">{skipped}</span></div>
            {failed > 0 && (
              <div>Failed: <span className="font-medium text-red-500">{failed}</span></div>
            )}
          </div>

          {/* Skipped records accordion */}
          {skipped > 0 && result.skippedDetails && result.skippedDetails.length > 0 && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="skipped">
                <AccordionTrigger>Skipped rows ({skipped})</AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    {Object.entries(
                      result.skippedDetails.reduce((acc, detail) => {
                        acc[detail.reason] = (acc[detail.reason] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([reason, count]) => (
                      <div key={reason} className="flex justify-between py-1">
                        <span>{reason}:</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Error records accordion */}
          {failed > 0 && result.errorDetails && result.errorDetails.length > 0 && (
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="errors">
                <AccordionTrigger>Errors ({failed})</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {hasForeignKeyErrors && (
                      <Button
                        onClick={onFixForeignKeyErrors}
                        className="w-full mb-4"
                      >
                        Fix Foreign Key Errors
                      </Button>
                    )}

                    <PaginatedTable
                      data={errorTableData}
                      columns={errorColumns}
                      rowsPerPage={5}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};