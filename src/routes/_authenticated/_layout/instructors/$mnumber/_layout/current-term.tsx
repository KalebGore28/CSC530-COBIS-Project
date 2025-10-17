import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/_layout/current-term',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_authenticated/_layout/instructors/$mnumber/current-term"!
    </div>
  )
}
