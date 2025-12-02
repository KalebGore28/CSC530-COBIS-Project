import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type StatusItem = {
  label: string
  count: number
  variant?: 'default' | 'destructive' | 'secondary' | 'outline'
}

type StatusCardProps = {
  title: string
  description?: string
  isLoading: boolean
  totalItems?: number
  emptyMessage?: string
  allGoodMessage?: string
  stats?: StatusItem[]
}

export function StatusCard({
  title,
  description,
  isLoading,
  totalItems,
  emptyMessage = 'No items found.',
  allGoodMessage = 'All items are up to date.',
  stats = [],
}: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>
            {description} {totalItems !== undefined ? totalItems : ''} {title}.
          </CardDescription>
        )}
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
          <div className="text-sm text-muted-foreground">{emptyMessage}</div>
        ) : stats.every((item) => item.count === 0) ? (
          <div className="text-sm text-green-600">{allGoodMessage}</div>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span>{item.label}:</span>
                <Badge variant={item.variant || 'destructive'}>{item.count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
