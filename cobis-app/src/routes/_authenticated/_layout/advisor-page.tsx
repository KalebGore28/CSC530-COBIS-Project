import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/advisor-page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_layout/advisor-page"!</div>
}
