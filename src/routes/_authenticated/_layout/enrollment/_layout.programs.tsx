import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import fuzzysort from 'fuzzysort'

import { programs } from '@/db/schema'

type Program = typeof programs.$inferSelect

// GraphQL imports
import { useQuery } from '@tanstack/react-query'
import { execute } from '@/graphql/execute'
import { graphql } from '@/graphql'

const programsPageQuery = graphql(`
  query programsPageQuery {
    programs {
      code
      description
      cip_code
      is_major
      is_minor
      has_concentration
      is_discontinued
      is_aacsb
      department_code
      college_code
      last_updated
    }
  }
`)

function fuzzySearchPrograms(programs: Program[], searchTerm: string) {
  if (!searchTerm) return programs
  const results = fuzzysort.go(searchTerm, programs, {
    keys: ['code', 'description'],
    threshold: -10000,
  })
  // @ts-ignore
  return results.map((r) => r.obj)
}

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/_layout/programs'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['programsPageQuery'],
    queryFn: () => execute(programsPageQuery),
  })

  const programsRaw = data?.programs ?? []
  const programs: Program[] = programsRaw.map((p) => ({
    code: p.code,
    description: p.description,
    cip_code: p.cip_code ?? null,
    is_major: p.is_major,
    is_minor: p.is_minor,
    has_concentration: p.has_concentration,
    is_discontinued: p.is_discontinued,
    is_aacsb: p.is_aacsb,
    department_code: p.department_code ?? null,
    college_code: p.college_code ?? null,
    last_updated: p.last_updated ? new Date(p.last_updated) : new Date(0),
  }))
  
  const allFiltered = fuzzySearchPrograms(programs, search)
  const limitedPrograms = allFiltered.slice(0, 20)

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
        ) : limitedPrograms.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No programs found.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              Showing {limitedPrograms.length} of {allFiltered.length} results
              {allFiltered.length > 20 && ' (limited to 20)'}
            </p>
            <div className="space-y-3">
              {limitedPrograms.map((program) => (
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
