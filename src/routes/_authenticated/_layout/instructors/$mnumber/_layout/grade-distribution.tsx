import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/_layout/grade-distribution',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_authenticated/_layout/instructors/$mnumber/_layout/grade-distributions"!
    </div>
  )
}
