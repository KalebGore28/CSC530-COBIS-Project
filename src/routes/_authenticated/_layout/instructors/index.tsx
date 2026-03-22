import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Search, Users } from 'lucide-react'
import { useState } from 'react'
import { eq, ilike, or, useLiveQuery } from '@tanstack/react-db'
import { InstructorsTable } from '@/components/tables/instructors-table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthentication } from '@/lib/auth-client'

import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { facultyCollection } from '@/integrations/tanstack-db/faculty'
import { usersCollection } from '@/integrations/tanstack-db/users'

// Helper function to get initials from name
const getInitials = (name: string): string => {
    if (!name) return 'N/A'
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
}

// Custom skeleton for InstructorsPage
function InstructorsPageSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between">
                    {/* Title & description skeletons */}
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-40" />
                    </div>

                    {/* Search & filter skeletons */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        <Skeleton className="h-10 w-62.5 rounded-lg" />
                        <Skeleton className="h-10 w-37.5 rounded-lg" />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    {/* Table header skeleton */}
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Skeleton className="h-4 w-32" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-40" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* Table body skeleton rows */}
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export const Route = createFileRoute('/_authenticated/_layout/instructors/')({
    beforeLoad: ({ context }) => {
        const roles = context.userSession?.roles
        if (
            !roles ||
            (!roles.has('department_chair') &&
                !roles.has('cobis_administrator'))
        ) {
            throw redirect({ to: '/login' })
        }

        void facultyCollection.preload()
        void departmentsCollection.preload()
        void collegesCollection.preload()
        void usersCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { userSession } = useAuthentication()

    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('')

    const { data: facultyData, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ faculty: facultyCollection })
                .where(({ faculty }) =>
                    or(
                        ilike(faculty.first_name, `%${searchQuery}%`),
                        ilike(faculty.last_name, `%${searchQuery}%`),
                        ilike(faculty.mnumber, `%${searchQuery}%`),
                    ),
                )
                .leftJoin(
                    { departments: departmentsCollection },
                    ({ faculty, departments }) =>
                        eq(faculty.department_id, departments.id),
                )
                .leftJoin(
                    { colleges: collegesCollection },
                    ({ faculty, colleges }) =>
                        eq(faculty.college_id, colleges.id),
                )
                .leftJoin({ users: usersCollection }, ({ faculty, users }) =>
                    eq(faculty.mnumber, users.mnumber),
                )
                .orderBy(({ faculty }) => faculty.last_name, 'asc'),
        [searchQuery], // Re-run when searchQuery changes
    )

    if (isLoading)
        return (
            <div className="mx-auto w-full space-y-6 p-6">
                <div className="mb-8 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <h2 className="col-span-full text-center text-2xl font-bold">
                        Instructors
                    </h2>
                    <p className="text-muted-foreground col-span-full text-center">
                        View and manage all instructors in your department
                    </p>
                </div>
                <InstructorsPageSkeleton />
            </div>
        )

    if (facultyData.length === 0) {
        ;<div className="mx-auto w-full space-y-6 p-6">
            <div className="mb-8 grid grid-cols-1 gap-2 md:grid-cols-2">
                <h2 className="col-span-full text-center text-2xl font-bold">
                    Instructors
                </h2>
                <p className="text-muted-foreground col-span-full text-center">
                    View and manage all instructors in your department
                </p>
            </div>
            <p className="text-muted-foreground text-center">
                No data available.
            </p>
        </div>
    }

    const filteredFaculty =
        searchQuery !== ''
            ? facultyData
            : facultyData.filter(
                  (d) =>
                      d.faculty.department_id ===
                      userSession?.faculty.department_id,
              )

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className="container mx-auto space-y-6 p-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5" />
                                Instructor Directory
                            </CardTitle>
                            <CardDescription className="max-w-100">
                                Currently only showing instructors from your
                                department. Use the search to find other
                                instructors. Showing {filteredFaculty.length}{' '}
                                instructor
                                {filteredFaculty.length !== 1 ? 's' : ''}.
                            </CardDescription>
                        </div>
                        {/* Search and Filter Controls*/}
                        <InputGroup className="w-full sm:max-w-80">
                            <InputGroupInput
                                id="input-group-url"
                                placeholder="Search instructors..."
                                onChange={handleSearchChange}
                            />

                            <InputGroupAddon align="inline-end">
                                <Search className="text-muted-foreground h-4 w-4" />
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFaculty.length > 0 ? (
                        <InstructorsTable
                            data={filteredFaculty.map((d) => ({
                                instructor: (
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    d.users?.image ?? undefined
                                                }
                                                alt={d.faculty.first_name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(
                                                    `${d.faculty.first_name} ${d.faculty.last_name}`,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{`${d.faculty.first_name} ${d.faculty.last_name}`}</span>
                                            <span className="text-muted-foreground text-sm">
                                                {d.faculty.mnumber}
                                            </span>
                                        </div>
                                    </div>
                                ),
                                mnumber: d.faculty.mnumber,
                                department:
                                    d.departments?.description ?? 'Unassigned',
                                college:
                                    d.colleges?.description ?? 'Unassigned',
                                email: d.users?.email ?? 'N/A',
                            }))}
                            onRowSelect={(row) => {
                                void navigate({
                                    to: `/instructors/${row.mnumber}`,
                                })
                            }}
                        />
                    ) : (
                        filteredFaculty.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="text-muted-foreground mb-4 h-12 w-12" />
                                <h3 className="text-lg font-medium">
                                    No instructors found
                                </h3>
                                <p className="text-muted-foreground mt-1">
                                    Try adjusting your search or filter to find
                                    what you're looking for.
                                </p>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
