import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { and, count, eq, sum, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { useCurrentTerm } from '@/providers/current-term-provider'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { CoursesTable } from '@/components/tables/current-term-courses-table'

function SelectedTermTableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Term Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-25">Course</TableHead>
                                <TableHead className="w-25">Title</TableHead>
                                <TableHead className="w-25">
                                    Credit Hours
                                </TableHead>
                                <TableHead className="w-25">
                                    Total Students
                                </TableHead>
                                <TableHead className="w-25">
                                    Total Credit Hours
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/_layout/current-term',
)({
    beforeLoad: () => {
        void coursesCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/instructors/$mnumber/_layout/current-term',
    })
    const mnumber = params.mnumber
    const navigate = useNavigate()

    const { currentTerm, isLoading: isCurrentTermLoading } = useCurrentTerm()

    const { data: currentTermData, isLoading: isCourseTermLoading } =
        useLiveQuery((q) =>
            q
                .from({ student: studentCoursesCollection })
                .where(({ student }) =>
                    and(
                        eq(student.instructor_mnumber, mnumber),
                        eq(student.year, currentTerm.year),
                        eq(student.term_id, currentTerm.term_id),
                    ),
                )
                .leftJoin(
                    { course: coursesCollection },
                    ({ student, course }) => eq(student.course_id, course.id),
                )
                .select(({ student, course }) => ({
                    course_id: student.course_id,
                    course_section: student.course_section,
                    course_title: course?.title,
                    total_students: count(student.mnumber),
                    total_credit_hours: sum(student.course_hours),
                }))
                .groupBy(({ student, course }) => [
                    student.course_id,
                    student.course_section,
                    course?.title,
                ])
                .distinct(),
        )

    if (isCurrentTermLoading || isCourseTermLoading)
        return <SelectedTermTableSkeleton />

    if (currentTermData.length === 0) {
        return (
            <div className="rounded-lg border">
                <p className="text-muted-foreground p-4 text-center">
                    No courses taught in {currentTerm.description}{' '}
                    {currentTerm.year}.
                </p>
            </div>
        )
    }

    return (
        <Card className="p-0">
            <CardContent className="bg-primary m-0 rounded-xl border p-1">
                <div className="rounded-lg border bg-white dark:bg-gray-700">
                    <CoursesTable
                        data={currentTermData
                            .map((course) => ({
                                course: `${course.course_id}-${course.course_section}`,
                                title: course.course_title || 'N/A',
                                total_students: course.total_students || 0,
                                total_credit_hours:
                                    course.total_credit_hours || 0,
                                action: (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            navigate({
                                                to: `/instructors/${mnumber}/term-history/${currentTerm.year}${currentTerm.term_id}/${course.course_id}-${course.course_section}`,
                                            })
                                        }
                                    >
                                        View Roster
                                    </Button>
                                ),
                            }))
                            .sort((a, b) => a.course.localeCompare(b.course))}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
