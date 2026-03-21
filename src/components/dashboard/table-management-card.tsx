import { ilike, isNull, or, useLiveQuery } from '@tanstack/react-db'
import { useNavigate } from '@tanstack/react-router'
import { Table } from 'lucide-react'
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

export function TableManangementCard() {
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
    )
        return null

    // Build summary of tables needing attention
    const issuesSummary = [
        {
            name: 'Academic Standing',
            count: academicStandings.length || 0,
        },
        {
            name: 'Admit Codes',
            count: admitCodes.length || 0,
        },
        {
            name: 'Colleges',
            count: colleges.length || 0,
        },
        {
            name: 'Courses',
            count: courses.length || 0,
        },
        {
            name: 'Deparments',
            count: departments.length || 0,
        },
        {
            name: 'Instructional Methods',
            count: instructionalMethods.length || 0,
        },
        {
            name: 'Part Of Terms',
            count: partOfTerms.length || 0,
        },
        {
            name: 'Programs',
            count: programs.length || 0,
        },
        {
            name: 'Registration Statuses',
            count: registrationStatuses.length || 0,
        },
    ].filter((item) => item.count > 0)

    const totalIssues = issuesSummary.reduce((sum, item) => sum + item.count, 0)
    const hasIssues = totalIssues > 0

    return (
        <Card
            className="h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
            onClick={() => navigate({ to: '/cobis-tools/manage-tables' })}
        >
            <CardHeader className="h-full">
                <div className="mb-2 flex items-center gap-2">
                    <Table className="h-6 w-6" />

                    <CardTitle>Table Management</CardTitle>
                </div>
                <CardDescription>
                    {issuesSummary.slice(0, 2).map((issue) => (
                        <div
                            key={issue.name}
                            className="flex items-baseline gap-2"
                        >
                            <span>{issue.name}</span>
                            <Badge variant="outline" className="ml-2">
                                {issue.count} Issue(s)
                            </Badge>
                        </div>
                    ))}
                    {issuesSummary.length > 2 && (
                        <span className="text-xs italic">
                            +{issuesSummary.length - 2} more...
                        </span>
                    )}
                </CardDescription>
                {hasIssues && (
                    <CardAction>
                        <Badge>Action Required</Badge>
                    </CardAction>
                )}
            </CardHeader>
            {hasIssues && (
                <CardFooter className="flex-col items-start gap-1.5">
                    {hasIssues ? (
                        <span className="text-orange-600 dark:text-orange-400">
                            {totalIssues} item{totalIssues !== 1 ? 's' : ''}{' '}
                            need attention
                        </span>
                    ) : (
                        <span className="text-green-600 dark:text-green-400">
                            All tables are up to date
                        </span>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
