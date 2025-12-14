import {
    Outlet,
    createFileRoute,
    redirect,
    useLocation,
    useNavigate,
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
    const navigate = useNavigate()
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
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            navigate({
                                to: `/cobis-tools/${value}`,
                            })
                        }
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="import"
                            >
                                Import
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="users"
                            >
                                Users
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="manage-tables"
                            >
                                Manage Tables
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
