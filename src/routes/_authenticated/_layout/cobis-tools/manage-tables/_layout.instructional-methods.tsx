import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/manage-tables/_layout/instructional-methods',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            Hello
            "/_authenticated/_layout/cobis-tools/manage-tables/_layout/instructional-methods"!
        </div>
    )
}
