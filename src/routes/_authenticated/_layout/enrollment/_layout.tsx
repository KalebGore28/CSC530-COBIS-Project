import {
    Outlet,
    createFileRoute,
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
    '/_authenticated/_layout/enrollment/_layout',
)({
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
                    <CardTitle>Enrollment Metrics</CardTitle>
                    <CardDescription>
                        Access various tools and utilities for Enrollment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            navigate({
                                to: `/enrollment/${value}`,
                            })
                        }
                        className="w-full"
                    >
                        <TabsList className="grid grid-cols-2">
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="programs"
                            >
                                Programs
                            </TabsTrigger>
                            <TabsTrigger
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                value="courses"
                            >
                                Courses
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
