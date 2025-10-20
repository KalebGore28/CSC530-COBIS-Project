import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";

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
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

  const resetImport = () => {
    setSelectedFile(null);
    setCsvData([]);
    // setImportResult(null);
  };


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
              const file = e.target.files?.[0] || null;
              setSelectedFile(file)
              // Reset parsed data if file changes
              if (!file) {
                resetImport();
              }
            }}
            onClearFile={resetImport}
            onParsedData={(results) => setCsvData(results.data as Record<string, string>[])}
            file={selectedFile}
          />

          {/* Step 2: CSV Preview */}
          {csvData.length > 0 && <div>
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

        </CardContent>
      </Card>
    </div>
  )
}
