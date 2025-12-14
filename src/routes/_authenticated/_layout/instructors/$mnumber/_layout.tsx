import {
    Outlet,
    createFileRoute,
    useLocation,
    useNavigate,
    useParams,
} from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import { facultyCollection } from '@/integrations/tanstack-db/faculty'
import { usersCollection } from '@/integrations/tanstack-db/users'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'

function InstructorPageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Profile section */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <Skeleton className="h-24 w-24 rounded-full" />

                        {/* Name + details */}
                        <div className="space-y-2 w-full max-w-sm">
                            <Skeleton className="h-8 w-3/4" /> {/* name */}
                            <Skeleton className="h-4 w-2/3" />{' '}
                            {/* department */}
                            <Skeleton className="h-4 w-1/2" /> {/* college */}
                            <Skeleton className="h-4 w-1/3" /> {/* email */}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="w-full flex justify-center">
                <div className="bg-background border rounded-lg w-full max-w-md">
                    <div className="grid grid-cols-3">
                        <Skeleton className="h-10 w-full rounded-none" />
                        <Skeleton className="h-10 w-full rounded-none" />
                        <Skeleton className="h-10 w-full rounded-none" />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
}

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/instructors/$mnumber',
    })
    const navigate = useNavigate()
    const location = useLocation()

    const mnumber = params.mnumber
    const activeTab = location.pathname.split('/').pop() || 'current-term'

    const { data: instructor, isLoading } = useLiveQuery((q) =>
        q
            .from({ faculty: facultyCollection })
            .where(({ faculty }) => eq(faculty.mnumber, mnumber))
            .leftJoin({ users: usersCollection }, ({ faculty, users }) =>
                eq(faculty.mnumber, users.mnumber),
            )
            .leftJoin(
                { departments: departmentsCollection },
                ({ faculty, departments }) =>
                    eq(faculty.department_code, departments.code),
            )
            .leftJoin(
                { colleges: collegesCollection },
                ({ faculty, colleges }) =>
                    eq(faculty.college_code, colleges.code),
            )
            .select(({ faculty, users, departments, colleges }) => ({
                ...faculty,
                email: users?.email,
                image: users?.image,
                department_description: departments?.description,
                college_description: colleges?.description,
            }))
            .findOne(),
    )

    if (isLoading) {
        return <InstructorPageSkeleton />
    }

    if (!instructor) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="text-muted-foreground">
                        Instructor not found
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Profile picture and info */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage
                                src={instructor.image || undefined}
                                alt={instructor.first_name}
                            />
                            <AvatarFallback className="text-2xl">
                                {getInitials(
                                    `${instructor.first_name} ${instructor.last_name}`,
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{`${instructor.first_name} ${instructor.last_name}`}</h1>
                            <p className="text-sm text-muted-foreground">
                                Department: {instructor.department_description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                College: {instructor.college_description}
                            </p>
                            <span className="inline-flex items-center text-sm space-x-1">
                                {instructor.email && (
                                    <a
                                        href={`mailto:${instructor.email}`}
                                        className="hover:underline"
                                    >
                                        <span>{instructor.email}</span>
                                    </a>
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="w-full flex justify-center">
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        navigate({
                            to: `/instructors/$mnumber/${value}`,
                            params: { mnumber },
                        })
                    }}
                    className="bg-background border rounded-lg"
                >
                    <TabsList className="grid grid-cols-3">
                        <TabsTrigger
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            value="current-term"
                        >
                            Current Term
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            value="term-history"
                        >
                            Teaching History
                        </TabsTrigger>
                        <TabsTrigger
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            value="grade-distribution"
                        >
                            Grade Distributions
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Nested routes render here */}
            <Outlet />
        </div>
    )
}
