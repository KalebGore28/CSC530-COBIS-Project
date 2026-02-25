import { createFileRoute, useNavigate  } from '@tanstack/react-router'
import { ilike, isNull, or, useLiveQuery } from '@tanstack/react-db'

import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

import { academicStandingCollection } from '@/integrations/tanstack-db/academic-standing'
import { admitCodesCollection } from '@/integrations/tanstack-db/admit-codes'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { instructionalMethodsCollection } from '@/integrations/tanstack-db/instructional-methods'
import { partOfTermCollection } from '@/integrations/tanstack-db/part-of-term'
import { programsCollection } from '@/integrations/tanstack-db/programs'
import { registrationStatusCollection } from '@/integrations/tanstack-db/registration-status'

import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout/manage-tables',
)({
    beforeLoad: () => {
        academicStandingCollection.preload()
        admitCodesCollection.preload()
        collegesCollection.preload()
        coursesCollection.preload()
        departmentsCollection.preload()
        instructionalMethodsCollection.preload()
        partOfTermCollection.preload()
        programsCollection.preload()
        registrationStatusCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()

    const { data: academicStandings, isLoading: isAcademicStandingsLoading } =
        useLiveQuery((q) =>
            q
                .from({ academicStandings: academicStandingCollection })
                .where(({ academicStandings }) =>
                    ilike(academicStandings.description, 'unknown%'),
                ),
        )

    const { data: admitCodes, isLoading: isAdmitCodesLoading } = useLiveQuery(
        (q) =>
            q
                .from({ admitCodes: admitCodesCollection })
                .where(({ admitCodes }) =>
                    ilike(admitCodes.description, 'unknown%'),
                ),
    )

    const { data: colleges, isLoading: isCollegesLoading } = useLiveQuery((q) =>
        q
            .from({ colleges: collegesCollection })
            .where(({ colleges }) => ilike(colleges.description, 'unknown%')),
    )

    const { data: courses, isLoading: isCoursesLoading } = useLiveQuery((q) =>
        q
            .from({ courses: coursesCollection })
            .where(({ courses }) =>
                or(
                    ilike(courses.title, 'Not known to COBIS yet%'),
                    ilike(courses.title, 'unknown%'),
                    isNull(courses.department_id),
                    isNull(courses.college_id),
                ),
            ),
    )

    const { data: departments, isLoading: isDepartmentsLoading } = useLiveQuery(
        (q) =>
            q
                .from({ departments: departmentsCollection })
                .where(({ departments }) =>
                    or(
                        ilike(departments.description, 'unknown%'),
                        isNull(departments.college_id),
                    ),
                ),
    )

    const {
        data: instructionalMethods,
        isLoading: isInstructionalMethodsLoading,
    } = useLiveQuery((q) =>
        q
            .from({ instructionalMethods: instructionalMethodsCollection })
            .where(({ instructionalMethods }) =>
                ilike(instructionalMethods.description, 'unknown%'),
            ),
    )

    const { data: partOfTerms, isLoading: isPartOfTermsLoading } = useLiveQuery(
        (q) =>
            q
                .from({ partOfTerms: partOfTermCollection })
                .where(({ partOfTerms }) =>
                    ilike(partOfTerms.description, 'unknown%'),
                ),
    )

    const { data: programs, isLoading: isProgramsLoading } = useLiveQuery((q) =>
        q
            .from({ programs: programsCollection })
            .where(({ programs }) =>
                or(
                    ilike(programs.description, 'unknown%'),
                    isNull(programs.department_id),
                    isNull(programs.college_id),
                ),
            ),
    )

    const {
        data: registrationStatuses,
        isLoading: isRegistrationStatusLoading,
    } = useLiveQuery((q) =>
        q
            .from({ registrationStatuses: registrationStatusCollection })
            .where(({ registrationStatuses }) =>
                ilike(registrationStatuses.description, 'unknown%'),
            ),
    )

    const coursesWithoutTitle = courses.reduce((sum, c) => {
        if (c.title.toLowerCase() === 'not known to cobis yet') return sum + 1
        if (c.title.toLowerCase() === 'unknown') return sum + 1
        return sum
    }, 0)
    const coursesWithoutDepartment = courses.reduce((sum, c) => {
        if (c.department_id === null) return sum + 1
        return sum
    }, 0)
    const coursesWithoutCollege = courses.reduce((sum, c) => {
        if (c.college_id === null) return sum + 1
        return sum
    }, 0)

    const programsWithoutDescription = programs.reduce((sum, p) => {
        if (p.description === 'unknown') return sum + 1
        return sum
    }, 0)
    const programsWithoutDepartment = programs.reduce((sum, p) => {
        if (p.department_id === null) return sum + 1
        return sum
    }, 0)
    const programsWithoutCollege = programs.reduce((sum, p) => {
        if (p.college_id === null) return sum + 1
        return sum
    }, 0)

    if (
        isAcademicStandingsLoading ||
        isAdmitCodesLoading ||
        isCollegesLoading ||
        isCoursesLoading ||
        isDepartmentsLoading ||
        isInstructionalMethodsLoading ||
        isPartOfTermsLoading ||
        isProgramsLoading ||
        isRegistrationStatusLoading
    ) {
        return (
            <div>
                <Skeleton />
            </div>
        )
    }

    return (
        <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Academic Standing Table</CardTitle>
                    <CardDescription>
                        {academicStandings.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {academicStandings.length}
                                </span>
                                <span>
                                    {academicStandings.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {academicStandings.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {academicStandings.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Admit Code Table</CardTitle>
                    <CardDescription>
                        {admitCodes.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {admitCodes.length}
                                </span>
                                <span>
                                    {admitCodes.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {admitCodes.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {admitCodes.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Colleges Table</CardTitle>
                    <CardDescription>
                        {colleges.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {colleges.length}
                                </span>
                                <span>
                                    {colleges.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {colleges.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {colleges.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Courses Table</CardTitle>
                    <CardDescription>
                        {courses.length > 0 ? (
                            <>
                                {coursesWithoutTitle > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {coursesWithoutTitle}
                                        </span>
                                        <span>
                                            {coursesWithoutTitle === 1
                                                ? 'row missing a title'
                                                : 'rows missing a title'}
                                        </span>
                                    </div>
                                )}
                                {coursesWithoutDepartment > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {coursesWithoutDepartment}
                                        </span>
                                        <span>
                                            {coursesWithoutDepartment === 1
                                                ? 'row missing a department'
                                                : 'rows missing a department'}
                                        </span>
                                    </div>
                                )}
                                {coursesWithoutCollege > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {coursesWithoutCollege}
                                        </span>
                                        <span>
                                            {coursesWithoutCollege === 1
                                                ? 'row missing a college'
                                                : 'rows missing a college'}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {courses.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {courses.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        {coursesWithoutTitle > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                Title
                            </Badge>
                        )}
                        {coursesWithoutDepartment > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                Department
                            </Badge>
                        )}
                        {coursesWithoutCollege > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                College
                            </Badge>
                        )}
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Departments Table</CardTitle>
                    <CardDescription>
                        {departments.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {departments.length}
                                </span>
                                <span>
                                    {departments.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {departments.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {departments.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Instructional Methods Table</CardTitle>
                    <CardDescription>
                        {instructionalMethods.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {instructionalMethods.length}
                                </span>
                                <span>
                                    {instructionalMethods.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {instructionalMethods.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {instructionalMethods.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Part Of Terms Table</CardTitle>
                    <CardDescription>
                        {partOfTerms.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {partOfTerms.length}
                                </span>
                                <span>
                                    {partOfTerms.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {partOfTerms.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {partOfTerms.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Programs Table</CardTitle>
                    <CardDescription>
                        {programs.length > 0 ? (
                            <>
                                {programsWithoutDescription > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {programsWithoutDescription}
                                        </span>
                                        <span>
                                            {coursesWithoutTitle === 1
                                                ? 'row missing a description'
                                                : 'rows missing a description'}
                                        </span>
                                    </div>
                                )}
                                {programsWithoutDepartment > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {programsWithoutDepartment}
                                        </span>
                                        <span>
                                            {programsWithoutDepartment === 1
                                                ? 'row missing a department'
                                                : 'rows missing a department'}
                                        </span>
                                    </div>
                                )}
                                {programsWithoutCollege > 0 && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-bold">
                                            {programsWithoutCollege}
                                        </span>
                                        <span>
                                            {coursesWithoutCollege === 1
                                                ? 'row missing a college'
                                                : 'rows missing a college'}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {programs.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {programs.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        {programsWithoutDescription > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                Description
                            </Badge>
                        )}
                        {programsWithoutDepartment > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                Department
                            </Badge>
                        )}
                        {programsWithoutCollege > 0 && (
                            <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                                College
                            </Badge>
                        )}
                    </CardFooter>
                )}
            </Card>
            <Card className="h-50">
                <CardHeader className="h-full">
                    <CardTitle>Registration Statuses Table</CardTitle>
                    <CardDescription>
                        {registrationStatuses.length > 0 ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">
                                    {registrationStatuses.length}
                                </span>
                                <span>
                                    {registrationStatuses.length === 1
                                        ? 'row missing a description'
                                        : 'rows missing a description'}
                                </span>
                            </div>
                        ) : (
                            <span className="text-green-600 dark:text-green-500">
                                No issues found ✓
                            </span>
                        )}
                    </CardDescription>
                    {registrationStatuses.length > 0 && (
                        <CardAction>
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            >
                                Action Required
                            </Badge>
                        </CardAction>
                    )}
                </CardHeader>
                {registrationStatuses.length > 0 && (
                    <CardFooter className="flex items-start gap-1.5 text-sm">
                        <span>Problems to resolve:</span>
                        <Badge className="cursor-pointer transistion hover:scale-[1.05] hover:shadlow-lg">
                            Description
                        </Badge>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
