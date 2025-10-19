import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/cobis-tools/')({
  component: RouteComponent,
  beforeLoad: async (context) => {
    throw redirect({ to: '/cobis-tools/import', params: context.params } )
  }
})

// This component will never be seen due to the redirect in beforeLoad
function RouteComponent() {
  return <div>Hello "/_authenticated/_layout/cobis-tools/"!</div>
}
