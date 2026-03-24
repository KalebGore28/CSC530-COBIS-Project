import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { academicStandingCollection } from '@/integrations/tanstack-db/academic-standing'
import { AcademicStandingTable } from '@/components/tables/academic-standing-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/academic-standings',
)({
    component: RouteComponent,
    validateSearch: (search): RouteParams => {
        return {
            filterColumn: search.filterColumn as string | undefined,
            filterValue: search.filterValue as string | undefined,
        }
    },
})

function RouteComponent() {
    const { filterColumn, filterValue } = Route.useSearch()
    const { data: academicStandings, isLoading } = useLiveQuery((q) =>
        q.from({ academicStandings: academicStandingCollection }),
    )
    return (
        <div>
            {!isLoading && (
                <AcademicStandingTable
                    data={academicStandings}
                    filterColumn={filterColumn}
                    filterValue={filterValue}
                />
            )}
        </div>
    )
}
