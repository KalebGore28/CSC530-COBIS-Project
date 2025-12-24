import { createFileRoute, useParams } from '@tanstack/react-router'
import { TermGradeDistribution } from '@/components/charts/term-grade-distributions'

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/_layout/grade-distribution',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/instructors/$mnumber/_layout/grade-distribution',
    })
    const mnumber = params.mnumber

    return (
        <TermGradeDistribution
            mnumber={mnumber}
            title="Grade Distribution"
            description="Grade distribution for all courses taught by this instructor."
        />
    )
}
