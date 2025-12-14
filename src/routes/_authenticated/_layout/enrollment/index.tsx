import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/enrollment/')({
    component: RouteComponent,
    beforeLoad: (context) => {
        throw redirect({ to: '/enrollment/programs', params: context.params })
    },
})

// This component will never be seen due to the redirect in beforeLoad
function RouteComponent() {
    return <div>Hello "/_authenticated/_layout/enrollment/"!</div>
}
