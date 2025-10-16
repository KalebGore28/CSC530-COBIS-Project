import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/instructors/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>
        <h1 className="text-2xl font-bold mb-4">Instructors</h1>
    </div>
}
