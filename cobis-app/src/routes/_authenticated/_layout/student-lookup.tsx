import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/student-lookup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/student-lookup"!</div>
}
