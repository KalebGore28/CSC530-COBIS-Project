import { useNavigate } from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type StatusItem = {
    label: string
    count: number
    variant?: 'default' | 'destructive' | 'secondary' | 'outline'
    filterColumn?: string
    filterValue?: string
}

type StatusCardProps = {
    title: string
    isLoading: boolean
    totalItems?: number
    emptyMessage?: string
    allGoodMessage?: string
    stats?: Array<StatusItem>
    navigateTo: string
}

export function StatusCard({
    title,
    isLoading,
    totalItems,
    emptyMessage = 'No items found.',
    allGoodMessage = 'No issues found. All good!',
    stats = [],
    navigateTo,
}: StatusCardProps) {
    const navigate = useNavigate()
    return (
        <Card
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate({ to: navigateTo })}
        >
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Overview of {totalItems !== undefined ? totalItems : ''}{' '}
                    {title}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        {stats.map((_, i) => (
                            <Skeleton key={i} className="h-4 w-1/3" />
                        ))}
                    </div>
                ) : totalItems === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : stats.every((item) => item.count === 0) ? (
                    <div className="text-sm text-green-600">
                        {allGoodMessage}
                    </div>
                ) : (
                    <div>
                        <span className="font-medium">Missing Data:</span>
                        <div className="flex flex-wrap gap-2">
                            {stats.map((item) => (
                                <Badge
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (
                                            item.filterColumn &&
                                            item.filterValue
                                        ) {
                                            navigate({
                                                to: `${navigateTo}?filterColumn=${item.filterColumn}&filterValue=${item.filterValue}`,
                                            })
                                        }
                                    }}
                                    key={item.label}
                                    variant={item.variant || 'destructive'}
                                    className="max-w-full whitespace-normal cursor-pointer select-none transition hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <span>{item.label}:</span> {item.count}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
