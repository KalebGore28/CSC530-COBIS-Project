import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

import { useLiveQuery, ilike, or } from '@tanstack/react-db'
import { programsCollection } from '@/collections/programs'

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/_layout/programs'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: programs, isLoading } = useLiveQuery((q) =>
    q.from({ programs: programsCollection })
      .where(({ programs }) =>
        or(
          ilike(programs.code, `%${search}%`),
          ilike(programs.description, `%${search}%`)
        )
      )
      .limit(100)
      .orderBy(({ programs }) => programs.code, 'asc'),
    [search] // Re-run when search changes
  )

  return (
    <Card className="max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Search Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No programs found.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              Limited to 100 results. Refine your search for more specific results.
            </p>
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program.code}
                  onClick={() =>
                    navigate({
                      to: '/enrollment/programs/$code',
                      params: { code: program.code },
                    })
                  }
                  className="border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{program.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {program.description}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {program.is_major && <Badge>Major</Badge>}
                      {program.is_minor && <Badge variant="secondary">Minor</Badge>}
                      {program.has_concentration && (
                        <Badge variant="outline">Concentration</Badge>
                      )}
                      {program.is_aacsb && <Badge variant="default">AACSB</Badge>}
                      {program.is_discontinued && (
                        <Badge variant="destructive">Discontinued</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
