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
    '/_authenticated/_layout/enrollment/_layout',
)({
    beforeLoad: ({ context }) => {
        const roles = context.userSession?.roles
        if (
            !roles ||
            (!roles.has('department_chair') && !roles.has('admin_assistant'))
        ) {
            throw redirect({ to: '/login' })
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
                    <CardTitle>Enrollment Metrics</CardTitle>
                    <CardDescription>
                        Access various tools and utilities for Enrollment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} className="w-full">
                        <TabsList className="grid grid-cols-2">
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="programs"
                            >
                                <Link
                                    to="/enrollment/programs"
                                    className="w-full"
                                >
                                    Programs
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="courses"
                            >
                                <Link
                                    to="/enrollment/courses"
                                    className="w-full"
                                >
                                    Courses
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
