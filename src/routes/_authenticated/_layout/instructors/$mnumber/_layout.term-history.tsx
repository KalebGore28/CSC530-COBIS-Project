import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent } from '@/components/ui/card'
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

import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'
import { termsCollection } from '@/integrations/tanstack-db/terms'
import { TeachingHistoryTable } from '@/components/tables/teaching-history-table'

function TermHistoryTableSkeleton() {
    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4">Term</TableHead>
                        <TableHead className="w-1/4">Total Courses</TableHead>
                        <TableHead className="w-1/4">Total Students</TableHead>
                        <TableHead className="w-1/4">
                            Total Credit Hours
                        </TableHead>
                        <TableHead className="w-1/4">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/_layout/term-history',
)({
    beforeLoad: () => {
        void termsCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/instructors/$mnumber/_layout/term-history',
    })
    const mnumber = params.mnumber
    const navigate = useNavigate()

    const { data: termHistory, isLoading } = useLiveQuery((q) =>
        q
            .from({ student: studentCoursesCollection })
            .where(({ student }) => eq(student.instructor_mnumber, mnumber))
            .leftJoin({ terms: termsCollection }, ({ student, terms }) =>
                eq(student.term_id, terms.id),
            )
            .select(({ student, terms }) => ({
                course_id: student.course_id,
                course_section: student.course_section,
                course_hours: student.course_hours,
                course_title: terms?.description,
                year: student.year,
                term_code: student.term_id,
                term_description: terms?.description,
                midterm_grade: student.midterm_grade,
                final_grade: student.final_grade,
            }))
            .orderBy(({ student }) => student.year, 'desc')
            .orderBy(({ student }) => student.term_id, 'desc'),
    )

    if (isLoading) return <TermHistoryTableSkeleton />

    type TermHistoryRecord = {
        term_code: string
        year: number
        course_id: string
        course_section: string
        course_hours: number
        course_title: string | undefined
        term_description: string | undefined
        total_students: number
        total_credit_hours: number
        total_courses: number
    }

    const termHistoryMap: Map<string, TermHistoryRecord> = new Map()
    termHistory.forEach((record) => {
        const key = `${record.year}-${record.term_code}`
        if (!termHistoryMap.has(key)) {
            termHistoryMap.set(key, {
                course_id: record.course_id,
                course_section: record.course_section,
                course_hours: record.course_hours,
                course_title: record.course_title,
                year: record.year,
                term_code: record.term_code,
                term_description: record.term_description || '',
                total_students: 0,
                total_credit_hours: 0,
                total_courses: 0,
            })
        }
        const entry = termHistoryMap.get(key)!
        entry.total_students += 1
        entry.total_credit_hours += record.course_hours || 0

        // Use a Set to track unique courses
        const courseKey = `${record.course_id}-${record.course_section}`
        if (!('uniqueCourses' in entry)) {
            ;(entry as any).uniqueCourses = new Set<string>()
        }
        ;(entry as any).uniqueCourses.add(courseKey)
        entry.total_courses = (entry as any).uniqueCourses.size
    })

    if (termHistory.length === 0) {
        return (
            <div className="rounded-lg border">
                <p className="text-muted-foreground p-4 text-center">
                    No term history available.
                </p>
            </div>
        )
    }

    return (
        <Card className="p-0">
            <CardContent className="m-0 p-1">
                <TeachingHistoryTable
                    data={Array.from(termHistoryMap.values()).map((term) => ({
                        term: `${term.term_description} ${term.year}`,
                        total_courses: term.total_courses,
                        total_students: term.total_students || 0,
                        total_credit_hours: term.total_credit_hours || 0,
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    navigate({
                                        to: `/instructors/${mnumber}/term-history/${term.year}${term.term_code}`,
                                    })
                                }
                            >
                                View Details
                            </Button>
                        ),
                    }))}
                />
            </CardContent>
        </Card>
    )
}
