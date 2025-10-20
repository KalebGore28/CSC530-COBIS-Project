import { createFileRoute, Outlet, Navigate, useRouterState } from '@tanstack/react-router'
import { useSession } from '@/components/provider/session'

export const Route = createFileRoute('/_authenticated')({
    component: RouteComponent,
})

function RouteComponent() {
    const { session, isLoading } = useSession()
    const routerState = useRouterState()

    if (isLoading) return null

    const pathname = routerState.location.pathname

    // No session → go to login
    if (!session) {
        if (pathname !== '/login') {
            localStorage.setItem('redirectTo', pathname)
            return <Navigate to="/login" search={{ redirectTo: pathname }} />
        }
        return null
    }

    // Not fully provisioned
    if (!session.isEnabled || !session.mnumber || session.roles.length === 0) {
        return <Navigate to="/waiting" />
    }

    // Return user to saved path (only once)
    const redirectTo = localStorage.getItem('redirectTo')
    if (redirectTo && redirectTo !== pathname) {
        localStorage.removeItem('redirectTo')
        return <Navigate to={redirectTo} replace />
    }

    return <Outlet />
}
