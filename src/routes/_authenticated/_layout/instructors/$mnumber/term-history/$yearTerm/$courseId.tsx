import {
    createFileRoute,
    redirect,
    useNavigate,
    useParams,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { and, eq, useLiveQuery } from '@tanstack/react-db'
import { Button } from '@/components/ui/button'

import { studentsCollection } from '@/integrations/tanstack-db/students'
import { studentAcademicInfoCollection } from '@/integrations/tanstack-db/student-academic-info'
import { termsCollection } from '@/integrations/tanstack-db/terms'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'

import { RosterInfoCard } from '@/components/roster/roster-info-card'
import { RosterGradeDistributions } from '@/components/roster/roster-grade-distributions'
import { RosterSummaryCard } from '@/components/roster/roster-summary-card'
import { RosterStudents } from '@/components/roster/roster-students'

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/$courseId',
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
        from: '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/$courseId',
    })
    const mnumber = params.mnumber
    const yearTerm = params.yearTerm
    const courseParam = params.courseId
    const navigate = useNavigate()

    const termCode = yearTerm?.slice(-2)
    const year = parseInt(yearTerm?.slice(0, 4) || '0', 10)
    const courseProps = courseParam.match(
        /^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/,
    )
    const course = {
        course_id: courseProps
            ? courseProps[1] + courseProps[2] + courseProps[3]
            : '',
        section: courseProps ? courseProps[4] : '',
    }

    const { data: instructorCourses, isLoading } = useLiveQuery((q) =>
        q
            .from({ studentCourse: studentCoursesCollection })
            .where(({ studentCourse }) =>
                and(
                    eq(studentCourse.instructor_mnumber, mnumber),
                    eq(studentCourse.year, year),
                    eq(studentCourse.term_code, termCode),
                    eq(studentCourse.course_id, course.course_id),
                    eq(studentCourse.course_section, course.section),
                ),
            )
            .leftJoin({ term: termsCollection }, ({ studentCourse, term }) =>
                eq(studentCourse.term_code, term.code),
            )
            .leftJoin(
                { course: coursesCollection },
                ({ studentCourse, course }) =>
                    eq(studentCourse.course_id, course.code),
            )
            .leftJoin(
                { student: studentsCollection },
                ({ studentCourse, student }) =>
                    eq(studentCourse.mnumber, student.mnumber),
            )
            // .leftJoin(
            //     { studentAcademicInfo: studentAcademicInfoCollection },
            //     ({ studentCourse, studentAcademicInfo }) =>
            //         eq(studentCourse.mnumber, studentAcademicInfo.mnumber),
            // )
            .select(
                ({
                    studentCourse,
                    term,
                    course,
                    // studentAcademicInfo,
                    student,
                }) => ({
                    mnumber: studentCourse.mnumber,
                    first_name: student?.first_name,
                    last_name: student?.last_name,
                    email: student?.email || undefined,
                    course_id: studentCourse.course_id,
                    course_section: studentCourse.course_section,
                    course_title: course?.title,
                    course_hours: studentCourse.course_hours, // We get the hours from studentCourse to account for variable credit courses
                    year: studentCourse.year,
                    term_code: studentCourse.term_code,
                    term_description: term?.description,
                    midterm_grade: studentCourse.midterm_grade,
                    final_grade: studentCourse.final_grade,
                    last_attendance: studentCourse.last_attendance,
                    // student_gpa: studentAcademicInfo?.overall_gpa || null,
                }),
            ),
    )

    if (!isLoading && (!instructorCourses || instructorCourses.length === 0)) {
        return (
            <div className="container p-6 mx-auto">
                <h1 className="text-2xl font-bold mb-4">Course Roster</h1>
                <p>No roster found for this course.</p>
            </div>
        )
    }

    return (
        <div className="w-full mx-auto p-6 space-y-6">
            <div className="flex flex-col">
                {/* Back button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        navigate({
                            to: `/instructors/${mnumber}/term-history/${yearTerm}`,
                        })
                    }
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Term Details
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2">
                <RosterInfoCard
                    className={'col-span-2'}
                    studentCourses={instructorCourses}
                    isLoading={isLoading}
                />
                <RosterGradeDistributions
                    className={'col-span-2 md:col-span-1'}
                    studentCourses={instructorCourses}
                    isLoading={isLoading}
                />
                <RosterSummaryCard
                    className={'col-span-2 md:col-span-1'}
                    studentCourses={instructorCourses}
                    isLoading={isLoading}
                />
                <RosterStudents
                    className={'col-span-2'}
                    studentCourses={instructorCourses}
                    isLoading={isLoading}
                />
            </div>
        </div>
    )
}
