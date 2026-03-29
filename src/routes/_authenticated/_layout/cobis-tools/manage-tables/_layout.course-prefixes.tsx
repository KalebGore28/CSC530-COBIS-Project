import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { coursePrefixesCollection } from '@/integrations/tanstack-db/course-prefixes'
import { CoursePrefixesTable } from '@/components/tables/course-prefixes-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/course-prefixes',
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
    const { data: coursePrefixes, isLoading } = useLiveQuery((q) =>
        q.from({ coursePrefixes: coursePrefixesCollection }),
    )
    return (
        <div>
            {!isLoading && (
                <CoursePrefixesTable
                    data={coursePrefixes}
                    filterColumn={filterColumn}
                    filterValue={filterValue}
                />
            )}
        </div>
    )
}
