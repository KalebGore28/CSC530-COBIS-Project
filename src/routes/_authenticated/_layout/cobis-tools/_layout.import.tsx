import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { importQueryOptions } from '@/hooks/use-import';
import { useQuery } from '@tanstack/react-query';
import { ImportProgressList } from '@/components/csv-import/import-progress-list';
import { toast } from "sonner";

import type { ParseResult } from 'papaparse';

import { FileUpload } from '@/components/csv-import/file-upload'
import { CsvPreview } from '@/components/csv-import/csv-preview'
import { TablePreview } from '@/components/csv-import/table-preview';

export type IssueMessage = {
  message: string;
  error?: string;
}

export type ProgressMessage = {
  message: string;
  table: string;
  currentTable: number;
  totalTables: number;
  currentRow: number;
  totalRows: number;
}

export type ProgressData = {
  progressMessages: ProgressMessage[];
  warnings: IssueMessage[];
  errors: IssueMessage[];
}

export const Route = createFileRoute(
  '/_authenticated/_layout/cobis-tools/_layout/import',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ParseResult<Record<string, string>> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: importResults = [], isLoading: isImporting, refetch: sendImport, isSuccess } = useQuery(importQueryOptions({
    filename: selectedFile?.name || '',
    csvData: csvData!,
  }))

  const resetImport = () => {
    setSelectedFile(null);
    setCsvData(null);
    setDrawerOpen(false);
  };

  const handleImport = () => {
    if (!selectedFile || !csvData) return
    setDrawerOpen(true);
    sendImport();
  }


  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">CSV Import</CardTitle>
          <CardDescription>
            Import data from CSV files into the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">

          {/* Step 1: File Upload */}
          <FileUpload
            onFileChange={(e) => {
              const file = e.target.files?.[0] || null
              setSelectedFile(file)
              if (!file) resetImport()
            }}
            onClearFile={resetImport}
            onParsedData={(results) =>
              setCsvData(results as ParseResult<Record<string, string>>)
            }
            file={selectedFile}
          />

          {/* Step 2: CSV Preview */}
          {csvData && <div>
            <h2 className="text-xl font-bold mb-4">Step 2: Preview Your Data</h2>
            <CsvPreview
              csvData={csvData}
              maxRows={5}
              highlightSpecialValues={true}
              minColumnWidth={150}
            />
          </div>}

          {/* Step 3: Table Preview */}
          {selectedFile && <div>
            <h2 className="text-xl font-bold mb-4">Step 3: Matching Tables</h2>
            <TablePreview fileName={selectedFile.name} />
          </div>}

          {/* Step 4: Import Confirmation */}
          {selectedFile && csvData && (
            <div>
              <Separator className="my-6" />
              <CardFooter className="flex justify-end">
                <div className={`${isSuccess ? 'hidden pointer-events-none' : ''} flex`}>
                  <Button variant="secondary" onClick={resetImport} className="mr-4">
                    Cancel
                  </Button>
                  <Button
                    className={`${isImporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleImport}
                    disabled={isImporting || isSuccess}
                  >
                    {isImporting ? 'Importing…' : 'Confirm Import'}
                  </Button>
                </div>
                <Drawer
                  open={drawerOpen}
                  onOpenChange={(e) => setDrawerOpen(e)}
                >
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Import Results</DrawerTitle>
                      <DrawerDescription>
                        {isImporting && 'Import in progress...'}
                        {isSuccess && 'Import completed successfully!'}
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="h-[75vh] px-4">
                      <ImportProgressList messages={importResults} />
                    </div>

                  </DrawerContent>
                </Drawer>
                {isSuccess && (
                  <>
                    <Button variant="outline" onClick={() => setDrawerOpen(true)} className="mr-4">
                      View Results
                    </Button>
                    <Button variant="outline" onClick={resetImport}>
                      New Import
                    </Button>
                  </>
                )}
              </CardFooter>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
