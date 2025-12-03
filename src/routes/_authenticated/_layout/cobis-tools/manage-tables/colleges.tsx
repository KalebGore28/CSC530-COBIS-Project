import { createFileRoute } from '@tanstack/react-router'

import { collegesCollection } from '@/collections/colleges'
import { useLiveQuery } from '@tanstack/react-db'
import { CollegeTable } from '@/components/tables/college-table'

type RouteParams = {
    filterColumn?: string
    filterValue?: string
}

export const Route = createFileRoute('/_authenticated/_layout/cobis-tools/manage-tables/colleges')({
    component: RouteComponent,
    validateSearch: (search): RouteParams => {
        return {
            filterColumn: search.filterColumn as string | undefined,
            filterValue: search.filterValue as string | undefined,
        }
    }
})

function RouteComponent() {
    const { filterColumn, filterValue } = Route.useSearch()
    const { data: colleges, isLoading } = useLiveQuery((q) => q.from({ colleges: collegesCollection }))

    return (
        <div className='p-4'>
            {!isLoading && (
                <CollegeTable
                    data={colleges}
                    defaultFilterColumn={filterColumn}
                    defaultFilterColumnValue={filterValue}
                />
            )}
        </div>
    )
}
