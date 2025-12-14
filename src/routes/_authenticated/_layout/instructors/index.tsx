import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Mail, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { eq, ilike, or, useLiveQuery } from '@tanstack/react-db'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthentication } from '@/lib/auth-client'

import { departmentsCollection } from '@/integrations/tanstack-db/departments'
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
                <div className="flex flex-wrap justify-between items-center">
                    {/* Title & description skeletons */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-4 w-40" />
                    </div>

                    {/* Search & filter skeletons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
        const permittedRoles = new Set([
            'department_chair',
            'cobis_administrator',
        ])
        if (
            !context.userSession?.roles.some((role) => permittedRoles.has(role))
        ) {
            throw redirect({ to: '/login' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { userSession } = useAuthentication()
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('')

    const { data: faculty, isLoading } = useLiveQuery(
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
                        eq(faculty.department_code, departments.code),
                )
                .leftJoin({ users: usersCollection }, ({ faculty, users }) =>
                    eq(faculty.mnumber, users.mnumber),
                )
                .orderBy(({ faculty }) => faculty.last_name, 'asc'),
        [searchQuery], // Re-run when searchQuery changes
    )

    if (isLoading)
        return (
            <div className="w-full p-6 mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
                    <h2 className="col-span-full text-center font-bold text-2xl">
                        Instructors
                    </h2>
                    <p className="text-muted-foreground col-span-full text-center">
                        View and manage all instructors in your department
                    </p>
                </div>
                <InstructorsPageSkeleton />
            </div>
        )

    if (!faculty || faculty.length === 0) {
        ;<div className="w-full p-6 mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
                <h2 className="col-span-full text-center font-bold text-2xl">
                    Instructors
                </h2>
                <p className="text-muted-foreground col-span-full text-center">
                    View and manage all instructors in your department
                </p>
            </div>
            <p className="text-center text-muted-foreground">
                No data available.
            </p>
        </div>
    }

    const filteredFaculty =
        searchQuery !== ''
            ? faculty
            : faculty.filter(
                  (d) =>
                      d.faculty.department_code ===
                      userSession?.faculty.department_code,
              )

    // Handle instructor selection
    const handleSelectInstructor = (mnumber: string) => {
        navigate({ to: '/instructors/$mnumber', params: { mnumber } })
    }

    // Handle search input change with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    return (
        <div className="w-full p-6 mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
                <h2 className="col-span-full text-center font-bold text-2xl">
                    Instructors
                </h2>
                <p className="text-muted-foreground col-span-full text-center">
                    View and manage all instructors in your department
                </p>
            </div>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Instructor Directory
                            </CardTitle>
                            <CardDescription className="flex flex-col">
                                <span>
                                    Currently only showing instructors from your
                                    department. Use the search to find other
                                    instructors.
                                </span>
                                <span>
                                    Showing {filteredFaculty.length} instructor
                                    {filteredFaculty.length !== 1 ? 's' : ''}.
                                </span>
                            </CardDescription>
                        </div>
                        {/* Search and Filter Controls*/}
                        <div className="flex flex-wrap gap-2 sm:gap-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search instructors..."
                                    className="pl-8 w-full"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredFaculty.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-62.5">
                                        Instructor
                                    </TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFaculty.map((d) => (
                                    <TableRow
                                        key={d.faculty.mnumber}
                                        className={`cursor-pointer hover:bg-muted/50 ${userSession?.faculty.department_code === d.faculty.department_code ? 'bg-background' : 'opacity-50 cursor-not-allowed'}`}
                                        onClick={() => {
                                            if (
                                                userSession?.faculty
                                                    .department_code ===
                                                d.faculty.department_code
                                            ) {
                                                handleSelectInstructor(
                                                    d.faculty.mnumber,
                                                )
                                            }
                                        }}
                                    >
                                        <TableCell className="truncate max-w-30">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={
                                                            d.users?.image ??
                                                            undefined
                                                        }
                                                        alt={
                                                            d.faculty.first_name
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            `${d.faculty.first_name} ${d.faculty.last_name}`,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{`${d.faculty.first_name} ${d.faculty.last_name}`}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {d.faculty.mnumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="truncate max-w-30">
                                            <div className="flex flex-col">
                                                <span>
                                                    {d.departments
                                                        ?.description ? (
                                                        d.departments
                                                            .description
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer"
                                                            onClick={(e) => {
                                                                if (
                                                                    !userSession
                                                                        ?.faculty
                                                                        .department_code
                                                                ) {
                                                                    console.error(
                                                                        'User session does not have a department assigned.',
                                                                    )
                                                                    return
                                                                }
                                                                facultyCollection.update(
                                                                    d.faculty
                                                                        .mnumber,
                                                                    (draft) => {
                                                                        draft.department_code =
                                                                            userSession.faculty.department_code!
                                                                    },
                                                                )
                                                                e.stopPropagation()
                                                            }}
                                                        >
                                                            Claim Instructor
                                                        </Button>
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="truncate max-w-30">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {d.users?.email ? (
                                                    <a
                                                        href={`mailto:${d.users.email}`}
                                                        className="hover:underline"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        {d.users.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        N/A
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        filteredFaculty.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
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
