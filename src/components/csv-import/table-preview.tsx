import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Database } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface TablePreviewProps {
    fileName: string
}

export function TablePreview({ fileName }: TablePreviewProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['import', 'match', fileName],
        queryFn: async () => {
            const response = await fetch(
                `/api/import/match?filename=${encodeURIComponent(fileName)}`,
            )
            if (!response.ok) throw new Error('Network response was not ok')
            return response.json()
        },
    })

    // --- Loading state ---
    if (isLoading) {
        return (
            <Card className="border-muted/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        Analyzing File
                    </CardTitle>
                    <CardDescription>
                        Checking <span className="font-mono">{fileName}</span>{' '}
                        for matching tables...
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-[60%]" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    // --- No matching tables found ---
    if (!data?.tableNames?.length) {
        return (
            <Alert variant="destructive" className="border-destructive/50">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>No matching tables found</AlertTitle>
                <AlertDescription>
                    The file{' '}
                    <span className="font-mono font-medium">{fileName}</span>{' '}
                    doesn't match any known import targets. Double-check the
                    file name or format.
                </AlertDescription>
            </Alert>
        )
    }

    // --- Successful match ---
    return (
        <Card className="border-success/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Recognized CSV
                </CardTitle>
                <CardDescription>
                    The file <span className="font-mono">{fileName}</span> will
                    populate the following tables:
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {data.tableNames.map((table: string) => (
                    <Badge
                        key={table}
                        variant="secondary"
                        className="text-sm font-mono px-3 py-1"
                    >
                        {table}
                    </Badge>
                ))}
            </CardContent>
        </Card>
    )
}
