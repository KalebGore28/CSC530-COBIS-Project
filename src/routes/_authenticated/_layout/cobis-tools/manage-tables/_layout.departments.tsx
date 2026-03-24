import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { DepartmentsTable } from '@/components/tables/departments-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/departments',
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
    const { data: departments, isLoading } = useLiveQuery((q) =>
        q.from({ departments: departmentsCollection }),
    )
    return (
        <div>
            {!isLoading && (
                <DepartmentsTable
                    data={departments}
                    filterColumn={filterColumn}
                    filterValue={filterValue}
                />
            )}
        </div>
    )
}
