import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Loader2Icon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { importProgressQuery } from '@/lib/import-progress'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/import/$id/progress',
)({
    component: ImportProgressPage,
})

function ImportProgressPage() {
    const { id: importId } = Route.useParams()
    const navigate = useNavigate()

    const { data: progress, isLoading } = useQuery(importProgressQuery(importId))

    const handleNewImport = () => {
        void navigate({ to: '/cobis-tools/import' })
    }

    const handleDownloadLogs = () => {
        window.open(`/api/import/${importId}/logs`, '_blank')
    }

    if (isLoading || !progress) {
        return (
            <div className="container mx-auto p-6 max-w-5xl space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <Skeleton className="h-8 w-64" />
                </div>

                {/* Cards Skeleton */}
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        )
    }

    const isDone = progress.done === true
    const hasError = !!progress.error
    const isProcessing = !isDone && !hasError
    const progressPercentage =
        progress.totalRows > 0
            ? Math.round((progress.processed / progress.totalRows) * 100)
            : 0

    // Cap error message display to 200 characters (full error in logs)
    const displayError = progress.error
        ? progress.error.length > 200
            ? progress.error.substring(0, 200) + '...'
            : progress.error
        : undefined

    // Determine status badge
    const getStatusBadge = () => {
        if (hasError) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Failed
                </Badge>
            )
        }
        if (isDone) {
            return (
                <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="gap-1">
                <Loader2Icon className="h-3 w-3 animate-spin" />
                Processing
            </Badge>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: '/cobis-tools/import' })}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Import Progress</h1>
                    <p className="text-muted-foreground">
                        Track your CSV import in real-time
                    </p>
                </div>
                {getStatusBadge()}
            </div>

            {/* Error Alert */}
            {hasError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Import Failed:</strong> {displayError}
                        {progress.error && progress.error.length > 200 && (
                            <p className="text-xs mt-1 opacity-80">
                                Download logs for full error details
                            </p>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Success Alert */}
            {isDone && !hasError && (
                <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900 dark:text-green-100">
                        <strong>Import Complete!</strong> Successfully processed{' '}
                        {progress.totalRows} rows.
                    </AlertDescription>
                </Alert>
            )}

            {/* Import Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Details</CardTitle>
                    <CardDescription>Information about this import job</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Import ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                            {importId}
                        </code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        {getStatusBadge()}
                    </div>
                </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isProcessing && (
                            <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
                        )}
                        Import Progress
                    </CardTitle>
                    <CardDescription>
                        {progress.currentStep || 'Processing...'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">
                                {progress.processed.toLocaleString()} /{' '}
                                {progress.totalRows.toLocaleString()} rows
                            </span>
                            <span className="text-muted-foreground">
                                {progressPercentage}%
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                    </div>

                    {/* Current Step */}
                    <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm font-mono">{progress.currentStep}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {isDone && (
                <Card>
                    <CardHeader>
                        <CardTitle>Next Steps</CardTitle>
                        <CardDescription>
                            What would you like to do next?
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-3">
                        <Button onClick={handleNewImport} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            New Import
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownloadLogs}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Logs
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    )
}
