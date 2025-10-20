import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { useImport } from '@/hooks/use-import';
import { toast } from "sonner";

import type { ParseResult } from 'papaparse';

import { FileUpload } from '@/components/csv-import/file-upload'
import { CsvPreview } from '@/components/csv-import/csv-preview'
import { TablePreview } from '@/components/csv-import/table-preview';

export const Route = createFileRoute(
  '/_authenticated/_layout/cobis-tools/_layout/import',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ParseResult<Record<string, string>> | null>(null);
  const importMutation = useImport();

  const resetImport = () => {
    setSelectedFile(null);
    setCsvData(null);
  };

  const handleImport = () => {
    if (!selectedFile || !csvData) return
    importMutation.mutate(
      { filename: selectedFile.name, csvData },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Import completed successfully!')
            resetImport()
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
                <Button variant="secondary" onClick={resetImport} className="mr-4">
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? 'Importing…' : 'Confirm Import'}
                </Button>
              </CardFooter>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
