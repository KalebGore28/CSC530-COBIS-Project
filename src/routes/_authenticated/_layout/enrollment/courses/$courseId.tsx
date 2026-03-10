import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { and, eq, gte, lte, useLiveQuery } from '@tanstack/react-db'
import type { Enrollment } from '@/components/charts/enrollment-trends'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

import { EnrollmentTrends } from '@/components/charts/enrollment-trends'

import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'
import { CourseCard } from '@/components/course-card'

export const Route = createFileRoute(
    '/_authenticated/_layout/enrollment/courses/$courseId',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/enrollment/courses/$courseId',
    })
    const navigate = useNavigate()

    const [startYear, setStartYear] = useState<number>(() =>
        new Date().getFullYear(),
    )
    const [startTerm, setStartTerm] = useState<string>('10')
    const [endYear, setEndYear] = useState<number>(() =>
        new Date().getFullYear(),
    )
    const [endTerm, setEndTerm] = useState<string>('90')

    const { data: courseEnrollment, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ courses: coursesCollection })
                .leftJoin(
                    { departments: departmentsCollection },
                    ({ courses, departments }) =>
                        eq(courses.department_id, departments.id),
                )
                .leftJoin(
                    { colleges: collegesCollection },
                    ({ courses, colleges }) =>
                        eq(courses.college_id, colleges.id),
                )
                .leftJoin(
                    { studentCourses: studentCoursesCollection },
                    ({ courses, studentCourses }) =>
                        eq(courses.id, studentCourses.course_id),
                )
                .where(({ courses }) => eq(courses.id, params.courseId))
                .where(({ studentCourses }) =>
                    and(
                        gte(studentCourses?.year, startYear),
                        lte(studentCourses?.year, endYear),
                        gte(studentCourses?.term_id, startTerm),
                        lte(studentCourses?.term_id, endTerm),
                    ),
                )
                .select(
                    ({ courses, departments, colleges, studentCourses }) => ({
                        id: courses.id,
                        subject: courses.subject,
                        number: courses.number,
                        suffix: courses.suffix,
                        title: courses.title,
                        hours: courses.hours,
                        last_updated: courses.last_updated,
                        department_description: departments?.description,
                        college_description: colleges?.description,
                        term_id: studentCourses?.term_id,
                        year: studentCourses?.year,
                    }),
                ),
        [params.courseId, startYear, startTerm, endYear, endTerm],
    )

    const exportToCSV = () => {
        if (courseEnrollment.length === 0) {
            toast.warning(
                'No enrollment data available to export. Try adjusting the date range.',
            )
            return
        }

        // Prepare the data for CSV export
        const csvData = courseEnrollment
            .filter((e) => e.term_id && e.year)
            .map((e) => ({
                'Course Code': e.id,
                Year: e.year,
                Term: e.term_id,
                Title: e.title || '',
                Department: e.department_description || '',
                College: e.college_description || '',
                Subject: e.subject || '',
                Number: e.number || '',
                Suffix: e.suffix || '',
                Hours: e.hours || '',
            }))

        // Convert to CSV
        const csv = Papa.unparse(csvData)

        // Create a blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute(
            'download',
            `enrollment-${params.courseId}-${startYear}-${endYear}.csv`,
        )
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="w-full mx-auto p-4 space-y-6">
            <div className="flex flex-col">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        navigate({
                            to: `/enrollment/courses`,
                        })
                    }
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Button>
            </div>

            <CourseCard
                courseCode={params.courseId}
                startYear={startYear}
                startTerm={startTerm}
                endYear={endYear}
                endTerm={endTerm}
                setStartYear={setStartYear}
                setStartTerm={setStartTerm}
                setEndYear={setEndYear}
                setEndTerm={setEndTerm}
                exportData={exportToCSV}
            />

            {isLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : (
                <div className="max-w-4xl mx-auto">
                    <EnrollmentTrends
                        className="max-w-4xl"
                        enrollments={
                            courseEnrollment
                                .map((e) => {
                                    if (!e.term_id || !e.year) {
                                        return false
                                    }

                                    return {
                                        term_id: e.term_id,
                                        year: e.year,
                                    } as Enrollment
                                })
                                .filter(Boolean) as Array<Enrollment>
                        }
                        title={`Enrollments for Course ${params.courseId}`}
                        description={courseEnrollment[0]?.title || undefined}
                    />
                </div>
            )}
        </div>
    )
}
