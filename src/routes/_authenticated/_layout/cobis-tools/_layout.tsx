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
        if (!context.userSession?.roles.includes('cobis_administrator')) {
            throw redirect({ to: '/dashboard' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const location = useLocation()

    const activeTab = location.pathname.split('/').pop() || 'import'
    return (
        <div className="p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cobis Tools</CardTitle>
                    <CardDescription>
                        Access various tools and utilities for Cobis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} className="w-full">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="import"
                            >
                                <Link
                                    to="/cobis-tools/import"
                                    className="w-full"
                                >
                                    Import
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="users"
                            >
                                <Link
                                    to="/cobis-tools/users"
                                    className="w-full"
                                >
                                    Users
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="manage-tables"
                            >
                                <Link
                                    to="/cobis-tools/manage-tables"
                                    className="w-full"
                                >
                                    Manage Tables
                                </Link>
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
