import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ParseResult } from 'papaparse'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { importQueryOptions } from '@/hooks/use-import'
import { ImportProgressList } from '@/components/csv-import/import-progress-list'

import { FileUpload } from '@/components/csv-import/file-upload'
import { CsvPreview } from '@/components/csv-import/csv-preview'
import { TablePreview } from '@/components/csv-import/table-preview'

export type IssueMessage = {
    message: string
    error?: string
}

export type ProgressMessage = {
    message: string
    table: string
    currentTable: number
    totalTables: number
    currentRow: number
    totalRows: number
}

export type ProgressData = {
    progressMessages: Array<ProgressMessage>
    warnings: Array<IssueMessage>
    errors: Array<IssueMessage>
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout/import',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [csvData, setCsvData] = useState<ParseResult<
        Record<string, string>
    > | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const {
        data: importResults = [],
        refetch: sendImport,
        isFetching,
        isSuccess,
    } = useQuery(
        importQueryOptions({
            filename: selectedFile?.name || '',
            csvData: csvData!,
        }),
    )

    const resetImport = () => {
        setSelectedFile(null)
        setCsvData(null)
        setDrawerOpen(false)
    }

    const handleImport = () => {
        if (!selectedFile || !csvData) return
        setDrawerOpen(true)
        void sendImport()
    }

    return (
        <div className="mx-auto max-w-5xl p-4">
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
                        onParsedData={(results) => setCsvData(results)}
                        file={selectedFile}
                    />

                    {/* Step 2: CSV Preview */}
                    {csvData && (
                        <div>
                            <h2 className="mb-4 text-xl font-bold">
                                Step 2: Preview Your Data
                            </h2>
                            <CsvPreview
                                csvData={csvData}
                                maxRows={5}
                                highlightSpecialValues={true}
                                minColumnWidth={150}
                            />
                        </div>
                    )}

                    {/* Step 3: Table Preview */}
                    {selectedFile && (
                        <div>
                            <h2 className="mb-4 text-xl font-bold">
                                Step 3: Matching Tables
                            </h2>
                            <TablePreview fileName={selectedFile.name} />
                        </div>
                    )}
                </CardContent>
                {/* Step 4: Import Confirmation */}
                {selectedFile && csvData && (
                    <CardFooter className="flex justify-end">
                        {/* Import and Cancel Buttons */}
                        {!isSuccess && (
                            <div
                                className={`${isFetching ? 'pointer-events-none hidden' : ''} flex`}
                            >
                                <Button
                                    variant="secondary"
                                    onClick={resetImport}
                                    className="mr-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`${isFetching ? 'cursor-not-allowed opacity-70' : ''}`}
                                    onClick={handleImport}
                                    disabled={isFetching}
                                >
                                    {isFetching
                                        ? 'Importing…'
                                        : 'Confirm Import'}
                                </Button>
                            </div>
                        )}
                        {/* Importing Indicator */}
                        {isFetching && !isSuccess && (
                            <div className="flex items-center space-x-2">
                                <span>Importing data, please wait...</span>
                            </div>
                        )}
                        {/* Import Success Buttons */}
                        {isSuccess && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setDrawerOpen(true)}
                                    className="mr-4"
                                >
                                    View Results
                                </Button>
                                <Button variant="outline" onClick={resetImport}>
                                    New Import
                                </Button>
                            </>
                        )}
                        <Drawer
                            open={drawerOpen}
                            onOpenChange={(e) => setDrawerOpen(e)}
                        >
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle>Import Results</DrawerTitle>
                                    <DrawerDescription>
                                        {isFetching
                                            ? 'Importing data, please wait...'
                                            : 'Import complete. Review the results below.'}
                                    </DrawerDescription>
                                </DrawerHeader>

                                <div className="h-[75vh] px-4">
                                    <ImportProgressList
                                        messages={importResults}
                                    />
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
