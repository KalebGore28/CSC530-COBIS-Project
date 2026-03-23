import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { academicStandingCollection } from '@/integrations/tanstack-db/academic-standing'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/academic-standings',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const { data: academicStandings, isLoading } = useLiveQuery((q) =>
        q.from({ academicStandings: academicStandingCollection }),
    )
    return (
        <div className="container p-6">
            Hello
            "/_authenticated/_layout/cobis-tools/manage-tables/_layout/academic-standings"!
        </div>
    )
}
