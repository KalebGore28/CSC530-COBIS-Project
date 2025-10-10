import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { useSession } from '@/context/session'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
    component: RouteComponent,
})

function RouteComponent() {
    const { session, isLoading } = useSession();
    const navigate = useNavigate();

    if (isLoading) return null;
    if (!session) navigate({ to: '/login' });
    if (!session?.isEnabled || !session.mnumber || session.roles.length === 0) navigate({ to: '/waiting' });

    return <Outlet />
}