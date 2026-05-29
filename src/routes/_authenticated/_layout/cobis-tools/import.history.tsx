import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'
import { eq } from '@tanstack/react-db/utils'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    Eye,
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { importJobsCollection } from '@/integrations/tanstack-db/import-jobs'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/import/history',
)({
    component: ImportHistoryPage,
    beforeLoad: () => {
        // Preload the collection
        void importJobsCollection.preload()
    },
})

function ImportHistoryPage() {
    const navigate = useNavigate()

    const { data: imports, isLoading } = useLiveQuery((q) =>
        q
            .from({ imports: importJobsCollection })
            .select(({ imports }) => imports)
            .orderBy(({ imports }) => imports.createdAt, 'desc'),
    )

    const handleViewProgress = (importId: string) => {
        void navigate({
            to: '/cobis-tools/import/$id/progress',
            params: { id: importId },
        })
    }

    const handleDownloadLogs = (importId: string) => {
        window.open(`/api/import/${importId}/logs`, '_blank')
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'done':
                return (
                    <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Failed
                    </Badge>
                )
            case 'processing':
                return (
                    <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Processing
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
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
                    <h1 className="text-3xl font-bold">Import History</h1>
                    <p className="text-muted-foreground">
                        View all previous CSV imports
                    </p>
                </div>
                <Button onClick={() => navigate({ to: '/cobis-tools/import' })}>
                    New Import
                </Button>
            </div>

            {/* Imports Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Imports</CardTitle>
                    <CardDescription>
                        All import jobs ordered by most recent
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : !imports || imports.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No imports found</p>
                            <Button
                                variant="link"
                                onClick={() => navigate({ to: '/cobis-tools/import' })}
                                className="mt-2"
                            >
                                Start your first import
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Rows</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Completed</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {imports.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">
                                                {job.fileName || (
                                                    <span className="text-muted-foreground italic">
                                                        Unknown
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(job.status)}
                                            </TableCell>
                                            <TableCell>
                                                {job.totalRows?.toLocaleString() || (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(job.createdAt),
                                                    'MMM d, yyyy h:mm a',
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {job.completedAt ? (
                                                    format(
                                                        new Date(job.completedAt),
                                                        'MMM d, yyyy h:mm a',
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleViewProgress(job.id)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {(job.status === 'done' ||
                                                        job.status === 'failed') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDownloadLogs(
                                                                    job.id,
                                                                )
                                                            }
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Logs
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
