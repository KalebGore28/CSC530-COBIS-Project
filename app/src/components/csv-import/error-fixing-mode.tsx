import React, { useState, useEffect } from "react";
import { ImportError } from "../../types/csv-import-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";

interface ErrorFixingModeProps {
  errors: ImportError[];
  currentErrorIndex: number;
  onPreviousError: () => void;
  onNextError: () => void;
  onFixedData: (formData: Record<string, string>) => void;
  onRetryImport: () => void;
  fixedRowsCount: number;
}

export const ErrorFixingMode: React.FC<ErrorFixingModeProps> = ({
  errors,
  currentErrorIndex,
  onPreviousError,
  onNextError,
  onFixedData,
  onRetryImport,
  fixedRowsCount,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const currentError = errors[currentErrorIndex];

  // Reset form data when current error changes
  useEffect(() => {
    if (!currentError || !currentError.dependencyInfo) return;

    // Pre-populate with values from the error's dependency info
    const initialData: Record<string, string> = {};
    if (currentError.dependencyInfo.values) {
      Object.entries(currentError.dependencyInfo.values).forEach(([key, value]) => {
        initialData[key] = value;
      });
    }

    // If we have a single value field, populate it
    if (currentError.dependencyInfo.value) {
      const firstColumn = currentError.dependencyInfo.columns?.[0] || "value";
      initialData[firstColumn] = currentError.dependencyInfo.value;
    }

    setFormData(initialData);
  }, [currentError, currentErrorIndex]);

  if (!currentError) {
    return (
      <Alert>
        <AlertDescription>No errors to fix</AlertDescription>
      </Alert>
    );
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFixedData(formData);
    setFormData({});
  };

  const isLastError = currentErrorIndex === errors.length - 1;
  const columns = currentError.dependencyInfo?.columns || [];
  const tableName = currentError.dependencyInfo?.tableName || "";

  return (
    <div>
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertTitle className="text-blue-800">Fixing Missing Reference Data</AlertTitle>
        <AlertDescription className="text-blue-700">
          Add the missing lookup values to continue with your import.
          {fixedRowsCount > 0 && (
            <div className="mt-1">
              <Badge variant="outline" className="bg-blue-100 border-blue-300">
                {fixedRowsCount} values added
              </Badge>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          Error {currentErrorIndex + 1} of {errors.length}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousError}
            disabled={currentErrorIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextError}
            disabled={isLastError}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            Add Missing {tableName} Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertDescription>{currentError.error}</AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-2">Original Row Data</h4>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                {Object.entries(currentError.row)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Missing Lookup Value</h4>
              <form onSubmit={handleSubmit}>
                {columns.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No columns specified for the lookup table.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {columns.map((column) => (
                      <div key={column}>
                        <Label htmlFor={column}>{column}</Label>
                        <Input
                          id={column}
                          value={formData[column] || ""}
                          onChange={(e) =>
                            handleInputChange(column, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}

                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-1" /> Add {tableName} Value
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </CardContent>

        {fixedRowsCount > 0 && isLastError && (
          <CardFooter className="border-t bg-gray-50">
            <div className="w-full flex justify-between items-center">
              <div>
                <span className="font-medium">{fixedRowsCount}</span> values added.
                Ready to retry import.
              </div>
              <Button variant="default" onClick={onRetryImport}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry Import
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};