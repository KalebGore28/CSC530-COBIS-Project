import { createFileRoute } from '@tanstack/react-router'

type RouteParams = {
    filter?: string
}

export const Route = createFileRoute('/_authenticated/_layout/cobis-tools/manage-tables/table')({
    component: RouteComponent,
    validateSearch: (search): RouteParams => {
        return {
            filter: search.filter as string | undefined,
        }
    }
})

function RouteComponent() {
    const { filter } = Route.useSearch()
    return (
        <div>
            Hello "/_authenticated/_layout/cobis-tools/manage-tables/$table"!
            <div>Filter: {filter}</div>
        </div>
    )
}
