import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { useCurrentTerm } from '@/providers/current-term-provider'
import { studentCoursesCollection } from '@/collections/student-courses'
import { coursesCollection } from '@/collections/courses'
import { CoursesTable } from '@/components/tables/current-term-courses-table'
import { useLiveQuery, eq, and, count, sum } from '@tanstack/react-db'


function SelectedTermTableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Term Courses</CardTitle>
                <CardDescription>
                    {/* {getCurrentYearTerm.term.description} {getCurrentYearTerm.year} */}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Course</TableHead>
                                <TableHead className="w-[100px]">Title</TableHead>
                                <TableHead className="w-[100px]">Credit Hours</TableHead>
                                <TableHead className="w-[100px]">Total Students</TableHead>
                                <TableHead className="w-[100px]">Total Credit Hours</TableHead>
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
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber' })
    const mnumber = params.mnumber!
    const navigate = useNavigate()

    const { currentTerm, isLoading: isCurrentTermLoading } = useCurrentTerm()

    const { data: currentTermData, isLoading: isCourseTermLoading } = useLiveQuery((q) =>
        q.from({ student: studentCoursesCollection })
            .where(({ student }) =>
                and(
                    eq(student.instructor_mnumber, mnumber),
                    eq(student.year, currentTerm.year),
                    eq(student.term_code, currentTerm.term_code)
                )
            )
            .leftJoin({ course: coursesCollection }, ({ student, course }) =>
                eq(student.course_id, course.code)
            )
            .select(({ student, course }) => ({
                course_id: student.course_id,
                course_section: student.course_section,
                course_hours: student.course_hours,
                course_title: course?.title,
                total_students: count(student.mnumber),
                total_credit_hours: sum(student.course_hours),
            }))
            .groupBy(({ student, course }) => [
                student.course_id,
                student.course_section,
                course?.title,
                student.course_hours,
            ])
            .distinct()
    )

    if (isCurrentTermLoading || isCourseTermLoading) return <SelectedTermTableSkeleton />

    if (currentTermData.length === 0) {
        return (
            <div className="border rounded-lg">
                <p className="p-4 text-center text-muted-foreground">
                    No courses taught in {currentTerm.description} {currentTerm.year}.
                </p>
            </div>
        )
    }

    return (
        <Card className='p-0'>
            <CardContent className='p-1 m-0 bg-blue-950 border bg-primary rounded-xl'>
                <div className='border rounded-lg bg-white dark:bg-gray-800'>
                    <CoursesTable data={currentTermData.map((course) => ({
                        course: `${course.course_id}-${course.course_section}`,
                        title: course.course_title || 'N/A',
                        credit_hour: course.course_hours,
                        total_students: course.total_students || 0,
                        total_credit_hours: course.total_credit_hours || 0,
                        action: (
                            <Button
                                size="sm"
                                onClick={() => navigate({ to: `/instructors/${mnumber}/term-history/${currentTerm.year}${currentTerm.term_code}/${course.course_id}-${course.course_section}` })}
                            >
                                View Roster
                            </Button>
                        ),
                    }))} />
                </div>
            </CardContent>
        </Card>
    )
}
