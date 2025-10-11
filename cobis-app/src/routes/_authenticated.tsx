import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useSession } from '@/components/provider/session'

export const Route = createFileRoute('/_authenticated')({
    component: RouteComponent,
})

function RouteComponent() {
    const { session, isLoading } = useSession()
    const routerState = useRouterState()
    const navigate = useNavigate()

    if (isLoading) return null
    if (!session) {
        if (routerState.location.pathname === '/login') {
            return null
        }
        localStorage.setItem('redirectTo', routerState.location.pathname)
        
        navigate({
            to: '/login',
            search: { redirectTo: routerState.location.pathname },
            replace: true,
        })
        return null
    }
    if (!session?.isEnabled || !session.mnumber || session.roles.length === 0) {
        navigate({
            to: '/waiting',
            replace: true,
        })
        return null
    }

    // Check if user has a redirectTo value in localStorage
    const redirectTo = localStorage.getItem('redirectTo')
    if (redirectTo && redirectTo !== routerState.location.pathname) {
        localStorage.removeItem('redirectTo')
        navigate({
            to: redirectTo,
            replace: true,
        })
        return null
    }

    return <Outlet />
}
