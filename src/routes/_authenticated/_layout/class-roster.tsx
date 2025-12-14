import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { eq, useLiveQuery } from '@tanstack/react-db'
import type {
    SelectedCourse,
    SelectedTerm,
} from '@/components/selectors/term-course-selector'
import { useAuthentication } from '@/lib/auth-client'

import { studentsCollection } from '@/integrations/tanstack-db/students'
import { studentAcademicInfoCollection } from '@/integrations/tanstack-db/student-academic-info'
import { termsCollection } from '@/integrations/tanstack-db/terms'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'

import { RosterInfoCard } from '@/components/roster/roster-info-card'
import { RosterGradeDistributions } from '@/components/roster/roster-grade-distributions'
import { RosterSummaryCard } from '@/components/roster/roster-summary-card'
import { RosterStudents } from '@/components/roster/roster-students'

import { TermCourseSelector } from '@/components/selectors/term-course-selector'

export const Route = createFileRoute('/_authenticated/_layout/class-roster')({
    component: ClassRosterPage,
})

function ClassRosterPage() {
    const { userSession } = useAuthentication()
    const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | undefined>(
        undefined,
    )
    const [selectedCourse, setSelectedCourse] = useState<
        SelectedCourse | undefined
    >(undefined)

    const { data: instructorCourses, isLoading } = useLiveQuery((q) =>
        q
            .from({ studentCourse: studentCoursesCollection })
            .where(({ studentCourse }) =>
                eq(
                    studentCourse.instructor_mnumber,
                    userSession?.user.mnumber || '',
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
            .leftJoin(
                { studentAcademicInfo: studentAcademicInfoCollection },
                ({ studentCourse, studentAcademicInfo }) =>
                    eq(studentCourse.mnumber, studentAcademicInfo.mnumber),
            )
            .select(
                ({
                    studentCourse,
                    term,
                    course,
                    studentAcademicInfo,
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
                    student_gpa: studentAcademicInfo?.overall_gpa || null,
                }),
            ),
    )

    if (!userSession || !userSession.user.mnumber) return null

    if (!isLoading && (!instructorCourses || instructorCourses.length === 0)) {
        return (
            <div className="container p-6 mx-auto">
                <h1 className="text-2xl font-bold mb-4">Class Roster</h1>
                <p>You are not listed as the instructor for any courses.</p>
            </div>
        )
    }

    // Filter instructorCourses based on selectedCourses
    const filteredInstructorCourses =
        selectedTerm && selectedCourse
            ? instructorCourses?.filter(
                  (course) =>
                      course.year === selectedTerm.year &&
                      course.term_code === selectedTerm.term_code &&
                      course.course_id === selectedCourse.course_id &&
                      course.course_section === selectedCourse.course_section,
              )
            : instructorCourses

    return (
        <div className="container p-6 mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Class Roster</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2">
                <TermCourseSelector
                    className={'col-span-2'}
                    studentCourses={instructorCourses}
                    isLoading={isLoading}
                    showStats={true}
                    selectedTerm={selectedTerm}
                    selectedCourse={selectedCourse}
                    setSelectedTerm={setSelectedTerm}
                    setSelectedCourse={setSelectedCourse}
                />

                {/* Roster and Info Cards */}
                {selectedCourse && (
                    <>
                        <RosterInfoCard
                            className={'col-span-2'}
                            studentCourses={filteredInstructorCourses}
                        />
                        <RosterGradeDistributions
                            className={'col-span-2 md:col-span-1'}
                            studentCourses={filteredInstructorCourses}
                        />
                        <RosterSummaryCard
                            className={'col-span-2 md:col-span-1'}
                            studentCourses={filteredInstructorCourses}
                        />
                        <RosterStudents
                            className={'col-span-2'}
                            studentCourses={filteredInstructorCourses}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
