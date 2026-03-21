import {
    createFileRoute,
    redirect,
    useNavigate,
    useParams,
} from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Calculator, Users } from 'lucide-react'
import { and, eq, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CourseGradeChart } from '@/components/charts/course-grade-distributions'
import { AdvisedStudentsCard } from '@/components/advised-students/advised-students-card'

import { CoursesTable } from '@/components/tables/current-term-courses-table'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'
import { termsCollection } from '@/integrations/tanstack-db/terms'

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/',
)({
    beforeLoad: ({ context }) => {
        const roles = context.userSession?.roles
        if (
            !roles ||
            (!roles.has('department_chair') &&
                !roles.has('cobis_administrator'))
        ) {
            throw redirect({ to: '/login' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/',
    })
    const mnumber = params.mnumber
    const yearTerm = params.yearTerm
    const navigate = useNavigate()

    const termCode = yearTerm.slice(-2)
    const year = parseInt(yearTerm.slice(0, 4) || '0', 10)

    const { data: termHistory, isLoading } = useLiveQuery((q) =>
        q
            .from({ student: studentCoursesCollection })
            .where(({ student }) =>
                and(
                    eq(student.instructor_mnumber, mnumber),
                    eq(student.year, year),
                    eq(student.term_id, termCode),
                ),
            )
            .leftJoin({ terms: termsCollection }, ({ student, terms }) =>
                eq(student.term_id, terms.id),
            )
            .leftJoin({ courses: coursesCollection }, ({ student, courses }) =>
                eq(student.course_id, courses.id),
            )
            .select(({ student, terms, courses }) => ({
                course_id: student.course_id,
                course_section: student.course_section,
                course_hours: student.course_hours,
                course_title: courses?.title,
                year: student.year,
                term_code: student.term_id,
                term_description: terms?.description,
                midterm_grade: student.midterm_grade,
                final_grade: student.final_grade,
            }))
            .orderBy(({ student }) => student.year, 'desc')
            .orderBy(({ student }) => student.term_id, 'desc'),
    )

    if (isLoading) return <div>Loading...</div>

    // Count the unique courses taught in the term
    const totalCourses = new Set(
        termHistory.map(
            (course) => `${course.course_id}-${course.course_section}`,
        ),
    ).size
    const totalStudents = termHistory.length
    const totalCreditHours = termHistory.reduce(
        (acc, course) => acc + (course.course_hours || 0),
        0,
    )

    type Course = {
        course_id: string
        course_section: string
        course_title: string
        credit_hour: number
        total_students: number
        total_credit_hours: number
    }
    const coursesMap: Map<string, Course> = new Map()
    termHistory.forEach((course) => {
        const key = `${course.course_id}-${course.course_section}`
        if (!coursesMap.has(key)) {
            coursesMap.set(key, {
                course_id: course.course_id,
                course_section: course.course_section,
                course_title: course.course_title || 'N/A',
                credit_hour: course.course_hours || 0,
                total_students: 0,
                total_credit_hours: 0,
            })
        }
        const existing = coursesMap.get(key)!
        existing.total_students += 1
        existing.total_credit_hours += course.course_hours || 0
    })

    return (
        <div className="mx-auto w-full space-y-6 p-4">
            {/* Statistics summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="col-span-3 w-full">
                    {/* Back button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() =>
                            navigate({
                                to: `/instructors/${mnumber}/term-history`,
                            })
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Term History
                    </Button>
                </div>

                <div className="col-span-3 text-center">
                    <h2 className="text-2xl font-bold">
                        {termHistory[0]?.term_description} {year}
                    </h2>
                </div>

                <Card size="sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-secondary h-8 w-8" />
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Courses
                                </p>
                                <p className="text-3xl font-bold">
                                    {totalCourses}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Users className="text-secondary h-8 w-8" />
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Students
                                </p>
                                <p className="text-3xl font-bold">
                                    {totalStudents}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Calculator className="text-secondary h-8 w-8" />
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Credit Hours
                                </p>
                                <p className="text-3xl font-bold">
                                    {totalCreditHours}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course details table */}
            <Card className="p-0">
                <CardContent className="bg-primary m-0 rounded-xl border p-1">
                    <div className="rounded-lg border bg-white dark:bg-gray-700">
                        <CoursesTable
                            data={Array.from(coursesMap.values()).map(
                                (course) => ({
                                    course: `${course.course_id}-${course.course_section}`,
                                    title: course.course_title,
                                    credit_hour: course.credit_hour,
                                    total_students: course.total_students,
                                    total_credit_hours:
                                        course.total_credit_hours,
                                    action: (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate({
                                                    to: `/instructors/${mnumber}/term-history/${year}${termCode}/${course.course_id}-${course.course_section}`,
                                                })
                                            }
                                        >
                                            View Roster
                                        </Button>
                                    ),
                                }),
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <CourseGradeChart studentCourses={termHistory} />

            <AdvisedStudentsCard
                advisorMnumber={mnumber}
                term_info={{
                    term_id: termCode,
                    year: year,
                    description: termHistory[0]?.term_description || '',
                }}
            />
        </div>
    )
}
