import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
    beforeLoad: () => {
        // Redirect to the dashboard as the default authenticated route
        throw redirect({ to: '/dashboard' });
    },
    component: RouteComponent,
})

function RouteComponent() {
    // This component will never actually render,
    return null;
}
