import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { CoursesTable } from '@/components/tables/courses-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/courses',
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
    const { data: courses, isLoading } = useLiveQuery((q) =>
        q.from({ courses: coursesCollection }),
    )
    return (
        <div>
            {!isLoading && (
                <CoursesTable
                    data={courses}
                    filterColumn={filterColumn}
                    filterValue={filterValue}
                />
            )}
        </div>
    )
}
