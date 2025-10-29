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
import { useImport } from '@/hooks/use-import';
import { toast } from "sonner";

import type { ParseResult } from 'papaparse';

import { FileUpload } from '@/components/csv-import/file-upload'
import { CsvPreview } from '@/components/csv-import/csv-preview'
import { TablePreview } from '@/components/csv-import/table-preview';

import { ImportSummary } from '@/components/csv-import/import-summary';

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
  const [progressData, setProgressData] = useState<ProgressData>({
    progressMessages: [],
    warnings: [],
    errors: [],
  });
  const importMutation = useImport((event) => {
    if (event.type === 'progress') {
      setProgressData((prev) => ({
        ...prev,
        progressMessages: [...prev.progressMessages, event.data as ProgressMessage],
      }));
    } else if (event.type === 'warning') {
      setProgressData((prev) => ({
        ...prev,
        warnings: [...prev.warnings, { message: event.data?.message }],
      }));
      console.warn('Warning:', event.data?.message);
    } else if (event.type === 'complete') {
      console.log('Import finished!')
    } else if (event.type === 'error') {
      setProgressData((prev) => ({
        ...prev,
        errors: [...prev.errors, { message: event.data?.message, error: event.data?.error }],
      }));
      console.error('Import error:', event.error)
    }
  });

  const resetImport = () => {
    setSelectedFile(null);
    setCsvData(null);
    importMutation.reset();
    setDrawerOpen(false);
    setProgressData({
      progressMessages: [],
      warnings: [],
      errors: [],
    });
  };

  const handleImport = () => {
    if (!selectedFile || !csvData) return
    importMutation.mutate(
      { filename: selectedFile.name, csvData },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Import completed successfully!')
          } else {
            toast.error(data.error || 'Import failed')
          }
        },
        onError: (err) => toast.error(err.message),
      }
    )
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
                <div className={`${importMutation.isSuccess ? 'hidden pointer-events-none' : ''} flex`}>
                  <Button variant="secondary" onClick={resetImport} className="mr-4">
                    Cancel
                  </Button>
                  <Button
                    className={`${importMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleImport}
                    disabled={importMutation.isPending || importMutation.isSuccess}
                  >
                    {importMutation.isPending ? 'Importing…' : 'Confirm Import'}
                  </Button>
                </div>
                <Drawer open={importMutation.isPending || drawerOpen} onOpenChange={(e) => setDrawerOpen(e)}>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Import Results</DrawerTitle>
                      <DrawerDescription>
                        {importMutation.isPending && 'Import in progress...'}
                        {importMutation.isSuccess && 'Import completed successfully!'}
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="h-[75vh] px-4">
                      <ImportSummary
                        progressMessages={progressData.progressMessages}
                        warnings={progressData.warnings}
                        errors={progressData.errors}
                        isImporting={importMutation.isPending}
                      />
                    </div>

                  </DrawerContent>
                </Drawer>
                {importMutation.isSuccess && (
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
