// ErrorFixingMode.tsx - For resolving import errors
import React, { useState } from "react";
import { ImportError } from "../../types/csv-import-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface ErrorFixingModeProps {
  errors: ImportError[];
  currentErrorIndex: number;
  onPreviousError: () => void;
  onNextError: () => void;
  onFixedData: (data: Record<string, string>) => void;
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
  fixedRowsCount
}) => {
  const currentError = errors[currentErrorIndex];
  const [formData, setFormData] = useState<Record<string, string>>({
    id: currentError?.dependencyInfo?.value || "",
    name: ""
  });

  if (!currentError) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFixedData(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertDescription>
          <p className="font-semibold">Some rows couldn't be imported due to missing reference data.</p>
          <p>Follow the steps below to fix {errors.length} remaining issues.</p>
        </AlertDescription>
      </Alert>

      {/* Error resolution interface */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-4">
          Issue {currentErrorIndex + 1} of {errors.length}
        </h3>

        <div className="space-y-4">
          <div>
            <p className="font-medium">Problem:</p>
            <p className="text-red-500">{currentError.error}</p>
          </div>

          <div>
            <p className="font-medium">Row data:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(currentError.row || {}).map(key => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {Object.values(currentError.row || {}).map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {currentError.dependencyInfo && (
            <div>
              <p className="font-medium">Required action:</p>
              <p>Add missing value "{currentError.dependencyInfo.value}" to "{currentError.dependencyInfo.tableName}" table</p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-2">Add Missing Value</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Missing Reference Data</DialogTitle>
                    <DialogDescription>
                      Add the missing value to fix this import error.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <form className="space-y-4" onSubmit={handleFormSubmit}>
                      <div className="grid gap-2">
                        <label htmlFor="id">ID</label>
                        <Input
                          id="id"
                          name="id"
                          value={formData.id}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="name">Name</label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <Button type="submit">Save</Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              disabled={currentErrorIndex === 0}
              onClick={onPreviousError}
            >
              Previous Issue
            </Button>

            <Button
              disabled={currentErrorIndex >= errors.length - 1}
              onClick={onNextError}
            >
              Next Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed data retry button */}
      <div className="flex justify-end">
        <Button
          disabled={fixedRowsCount === 0}
          onClick={onRetryImport}
        >
          Retry Import with Fixed Data ({fixedRowsCount})
        </Button>
      </div>
    </div>
  );
};