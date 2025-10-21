import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/',
)({
  component: RouteComponent,
  beforeLoad: async (context) => {
    throw redirect({ to: '/instructors/$mnumber/current-term', params: context.params } )

  }
})

// This component will never be seen due to the redirect in beforeLoad
function RouteComponent() {
  return <div>Hello "/_authenticated/_layout/instructors/$mnumber/"!</div>
}
