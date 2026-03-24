import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { instructionalMethodsCollection } from '@/integrations/tanstack-db/instructional-methods'
import { InstructionalMethodsTable } from '@/components/tables/instructional-methods-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/instructional-methods',
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
    const { data: instructionalMethods, isLoading } = useLiveQuery((q) =>
        q.from({ instructionalMethods: instructionalMethodsCollection }),
    )
    return (
        <div>
            {!isLoading && (
                <InstructionalMethodsTable
                    data={instructionalMethods}
                    filterColumn={filterColumn}
                    filterValue={filterValue}
                />
            )}
        </div>
    )
}
