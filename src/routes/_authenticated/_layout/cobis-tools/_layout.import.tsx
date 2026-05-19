import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { uploadCsv } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Upload, ArrowRight } from 'lucide-react'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout/import',
)({
    component: ImportPage,
})

function ImportPage() {
    const navigate = useNavigate()
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [importId, setImportId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)
        setImportId(null)
        setError(null)
        setProgress(0)
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first')
            return
        }

        setUploading(true)
        setError(null)
        setImportId(null)
        setProgress(0)

        try {
            const result = await uploadCsv(file, (pct) => {
                setProgress(pct)
            })

            setImportId(result.importId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleReset = () => {
        setFile(null)
        setProgress(0)
        setImportId(null)
        setError(null)
        setUploading(false)
    }

    const handleTrackImport = () => {
        if (importId) {
            void navigate({
                to: '/cobis-tools/import/$id/progress',
                params: { id: importId },
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-6 w-6" />
                    CSV Import
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* File Input */}
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Select CSV File</Label>
                    <Input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {file && (
                        <p className="text-sm text-muted-foreground">
                            Selected: {file.name} ({(file.size / 1024).toFixed(2)}{' '}
                            KB)
                        </p>
                    )}
                </div>

                {/* Progress Bar */}
                {uploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                )}

                {/* Success Message */}
                {importId && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            <div className="space-y-2">
                                <p className="font-semibold">Upload successful!</p>
                                <p className="text-sm">
                                    Your file has been uploaded and is ready for
                                    processing.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            <p className="font-semibold">Upload failed</p>
                            <p className="text-sm">{error}</p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!importId && (
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-1"
                        >
                            {uploading ? 'Uploading...' : 'Upload CSV'}
                        </Button>
                    )}

                    {importId && (
                        <>
                            <Button
                                onClick={handleTrackImport}
                                className="flex-1"
                            >
                                Track Import Progress
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                            >
                                New Import
                            </Button>
                        </>
                    )}

                    {error && (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={uploading}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
