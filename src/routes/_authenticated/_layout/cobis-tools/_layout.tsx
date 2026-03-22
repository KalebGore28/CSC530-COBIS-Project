import {
    Link,
    Outlet,
    createFileRoute,
    redirect,
    useLocation,
} from '@tanstack/react-router'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout',
)({
    beforeLoad: ({ context }) => {
        const roles = context.userSession?.roles
        if (!roles || !roles.has('cobis_administrator')) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const location = useLocation()

    const activeTab = location.pathname.split('/').pop() || 'import'
    return (
        <div className="container mx-auto space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cobis Tools</CardTitle>
                    <CardDescription>
                        Access various tools and utilities for Cobis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab}>
                        <TabsList>
                            <TabsTrigger value="users">
                                <Link to="/cobis-tools/users">Users</Link>
                            </TabsTrigger>
                            <TabsTrigger value="manage-tables">
                                <Link to="/cobis-tools/manage-tables">
                                    Manage Tables
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="import">
                                <Link to="/cobis-tools/import">Import</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Nested routes render here */}
            <Outlet />
        </div>
    )
}
