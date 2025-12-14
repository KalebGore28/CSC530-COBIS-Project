import {
    ClientOnly,
    Outlet,
    createFileRoute,
    redirect,
} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: ({ context }) => {
        if (!context.userSession?.session) {
            throw redirect({ to: '/login' })
        }
    },
    component: RouteComponent,
})

// Wrap the authenticated layout in ClientOnly to prevent hydration issues
function RouteComponent() {
    return (
        <ClientOnly>
            <Outlet />
        </ClientOnly>
    )
}
