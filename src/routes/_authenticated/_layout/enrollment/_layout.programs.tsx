import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { eq, ilike, or, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuthentication } from '@/lib/auth-client'

import { programsCollection } from '@/integrations/tanstack-db/programs'

export const Route = createFileRoute(
    '/_authenticated/_layout/enrollment/_layout/programs',
)({
    beforeLoad: () => {
        void programsCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { userSession } = useAuthentication()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    const { data: programData, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ programs: programsCollection })
                .where(({ programs }) =>
                    or(
                        ilike(programs.id, `%${search}%`),
                        ilike(programs.description, `%${search}%`),
                    ),
                )
                .where(({ programs }) =>
                    eq(
                        programs.department_id,
                        userSession?.faculty.department_id,
                    ),
                )
                .limit(100)
                .orderBy(({ programs }) => programs.id, 'asc'),
        [search], // Re-run when search changes
    )

    return (
        <Card className="mx-auto mt-6 max-w-4xl">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Search Programs
                </CardTitle>
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
                ) : programData.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">
                        No programs found.
                    </p>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-2 text-xs">
                            Limited to programs within your department. Results
                            limited to 100 entries. Refine your search to narrow
                            results.
                        </p>
                        <div className="space-y-3">
                            {programData.map((program) => (
                                <div
                                    key={program.id}
                                    onClick={() =>
                                        navigate({
                                            to: '/enrollment/programs/$code',
                                            params: { code: program.id },
                                        })
                                    }
                                    className="hover:bg-accent cursor-pointer rounded-md border p-3 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {program.id}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {program.description}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-[10px]">
                                                Last updated:{' '}
                                                {new Date(
                                                    program.last_updated,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {program.is_major && (
                                                <Badge>Major</Badge>
                                            )}
                                            {program.is_minor && (
                                                <Badge variant="secondary">
                                                    Minor
                                                </Badge>
                                            )}
                                            {program.has_concentration && (
                                                <Badge variant="outline">
                                                    Concentration
                                                </Badge>
                                            )}
                                            {program.is_aacsb && (
                                                <Badge variant="default">
                                                    AACSB
                                                </Badge>
                                            )}
                                            {program.is_discontinued && (
                                                <Badge variant="destructive">
                                                    Discontinued
                                                </Badge>
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
