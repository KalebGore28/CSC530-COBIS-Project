import React, { useState, useEffect } from "react";
import { ImportError } from "../../../types/csv-import-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, FileText, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ErrorFixingModeProps {
  errors: ImportError[];
  onFixedData: (formData: Record<string, string>, errorKey: string) => void;
  onRetryImport: () => void;
  fixedCount: number; // Renamed from fixedRowsCount for clarity
}

// Type for grouped errors
interface GroupedError {
  key: string;
  tableName: string;
  columns: string[];
  values: Record<string, string>;
  affectedRows: number;
  isFixed: boolean;
}

export const ErrorFixingMode: React.FC<ErrorFixingModeProps> = ({
  errors,
  onFixedData,
  onRetryImport,
  fixedCount,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [groupedErrors, setGroupedErrors] = useState<GroupedError[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [sampleRowData, setSampleRowData] = useState<Record<string, string>>({});

  // Group errors by the missing reference values
  useEffect(() => {
    if (!errors.length) return;

    const errorGroups: Record<string, GroupedError> = {};

    errors.forEach((error) => {
      if (!error.dependencyInfo) return;

      // Create a key based on the tableName and values
      const tableName = error.dependencyInfo.tableName || "unknown";
      const values = error.dependencyInfo.values || {};
      const columns = error.dependencyInfo.columns || [];

      // Create a stable key from the values
      const valuesKey = Object.entries(values)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

      const key = `${tableName}:${valuesKey}`;

      if (!errorGroups[key]) {
        errorGroups[key] = {
          key,
          tableName,
          columns,
          values,
          affectedRows: 1,
          isFixed: false
        };
      } else {
        errorGroups[key].affectedRows++;
      }
    });

    setGroupedErrors(Object.values(errorGroups));

    // Set sample row data for the first group
    if (Object.values(errorGroups).length > 0) {
      const firstGroup = Object.values(errorGroups)[0];
      const firstMatchingError = errors.find(error => {
        if (!error.dependencyInfo) return false;

        const tableName = error.dependencyInfo.tableName || "unknown";
        const values = error.dependencyInfo.values || {};
        const valuesKey = Object.entries(values)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([key, value]) => `${key}:${value}`)
          .join('|');

        return `${tableName}:${valuesKey}` === firstGroup.key;
      });

      if (firstMatchingError) {
        setSampleRowData(firstMatchingError.row);
      }
    }
  }, [errors]);

  // Set initial form data for the active group
  useEffect(() => {
    if (groupedErrors.length === 0 || activeGroupIndex >= groupedErrors.length) return;

    const activeGroup = groupedErrors[activeGroupIndex];
    setFormData(activeGroup.values || {});

    // Find a sample row for this group
    const matchingError = errors.find(error => {
      if (!error.dependencyInfo) return false;

      const tableName = error.dependencyInfo.tableName || "unknown";
      const values = error.dependencyInfo.values || {};
      const valuesKey = Object.entries(values)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

      return `${tableName}:${valuesKey}` === activeGroup.key;
    });

    if (matchingError) {
      setSampleRowData(matchingError.row);
    }
  }, [activeGroupIndex, groupedErrors, errors]);

  if (!errors.length || groupedErrors.length === 0) {
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
    if (activeGroupIndex >= groupedErrors.length) return;

    const activeGroup = groupedErrors[activeGroupIndex];
    onFixedData(formData, activeGroup.key);

    // Mark this group as fixed
    setGroupedErrors(prev =>
      prev.map((group, idx) =>
        idx === activeGroupIndex ? { ...group, isFixed: true } : group
      )
    );

    // Move to the next unfixed group if available
    const nextUnfixedIndex = groupedErrors.findIndex((group, idx) => idx > activeGroupIndex && !group.isFixed);
    if (nextUnfixedIndex !== -1) {
      setActiveGroupIndex(nextUnfixedIndex);
    }
  };

  const activeGroup = groupedErrors[activeGroupIndex];

  // Calculate our own fixed count based on the internal state
  const fixedGroups = groupedErrors.filter(group => group.isFixed).length;
  const totalAffectedRows = groupedErrors.reduce((sum, group) => sum + group.affectedRows, 0);

  // Use either our internal state or the prop for fixed rows (in real app, should be managed externally)
  const fixedRows = fixedCount || groupedErrors
    .filter(group => group.isFixed)
    .reduce((sum, group) => sum + group.affectedRows, 0);

  const allFixed = fixedGroups === groupedErrors.length;

  return (
    <div>
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertTitle className="text-blue-800">Fixing Missing Reference Data</AlertTitle>
        <AlertDescription className="text-blue-700">
          <div className="flex justify-between items-center">
            <div>
              Add the missing lookup values to continue with your import.
              <div className="mt-1 flex gap-2">
                <Badge variant="outline" className="bg-blue-100 border-blue-300">
                  {fixedGroups} of {groupedErrors.length} references fixed
                </Badge>
                <Badge variant="outline" className="bg-blue-100 border-blue-300">
                  {fixedRows} of {totalAffectedRows} rows affected
                </Badge>
              </div>
            </div>
            {allFixed && (
              <Button variant="default" size="sm" onClick={onRetryImport}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry Import
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="list" className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Reference List</TabsTrigger>
          <TabsTrigger value="fix">Fix References</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-3">Missing References ({groupedErrors.length})</h3>
          <ScrollArea className="h-[250px]">
            <div className="space-y-2">
              {groupedErrors.map((group, index) => (
                <div
                  key={group.key}
                  className={`p-3 rounded-md border flex items-center justify-between cursor-pointer hover:bg-gray-50 ${index === activeGroupIndex ? 'bg-blue-50 border-blue-200' : ''
                    } ${group.isFixed ? 'bg-green-50 border-green-200' : ''}`}
                  onClick={() => setActiveGroupIndex(index)}
                >
                  <div>
                    <div className="font-medium flex items-center">
                      {group.isFixed && <CheckCircle className="h-4 w-4 text-green-600 mr-1" />}
                      {group.tableName}
                      <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-100">
                        {group.affectedRows} {group.affectedRows === 1 ? 'row' : 'rows'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {Object.entries(group.values).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: <span className="font-mono">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={group.isFixed}
                      onClick={() => setActiveGroupIndex(index)}
                    >
                      {group.isFixed ? 'Fixed' : 'Fix'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="fix">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Add Missing {activeGroup.tableName} Value
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prevIndex = activeGroupIndex > 0 ? activeGroupIndex - 1 : groupedErrors.length - 1;
                      setActiveGroupIndex(prevIndex);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextIndex = (activeGroupIndex + 1) % groupedErrors.length;
                      setActiveGroupIndex(nextIndex);
                    }}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Reference {activeGroupIndex + 1} of {groupedErrors.length}
                <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-100">
                  Affects {activeGroup.affectedRows} {activeGroup.affectedRows === 1 ? 'row' : 'rows'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Sample Row Data
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm h-[200px] overflow-y-auto">
                    {Object.entries(sampleRowData)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => (
                        <div key={key} className="mb-1">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {activeGroup.isFixed ? 'Reference Fixed' : 'Add Missing Reference'}
                  </h4>

                  {activeGroup.isFixed ? (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-center text-green-700 mb-2">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">This reference has been fixed</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Object.entries(formData).map(([key, value]) => (
                          <div key={key} className="mb-1">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {activeGroup.columns.length === 0 ? (
                        <Alert>
                          <AlertDescription>
                            No columns specified for the lookup table.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          {activeGroup.columns.map((column) => (
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
                            <Plus className="h-4 w-4 mr-1" />
                            Add {activeGroup.tableName} Reference
                          </Button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </CardContent>

            {allFixed && (
              <CardFooter className="border-t bg-gray-50">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <span className="font-medium">{fixedGroups}</span> references fixed,
                    affecting <span className="font-medium">{fixedRows}</span> rows.
                    Ready to retry import.
                  </div>
                  <Button variant="default" onClick={onRetryImport}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Retry Import
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};