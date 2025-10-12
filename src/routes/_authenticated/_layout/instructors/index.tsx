import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/instructors/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_authenticated/_layout/instructors/"!</div>
}
