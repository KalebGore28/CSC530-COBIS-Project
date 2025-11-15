import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';

import { type Enrollment, EnrollmentTrends } from '@/components/charts/enrollment-trends';

import { coursesCollection } from '@/collections/courses';
import { departmentsCollection } from '@/collections/departments';
import { collegesCollection } from '@/collections/colleges';
import { studentCoursesCollection } from '@/collections/student-courses';
import { useLiveQuery, eq, and, gte, lte } from '@tanstack/react-db';

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/courses/$courseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/enrollment/courses/$courseId' })
  const navigate = useNavigate()
  // Split courseId into subject, number, suffix. Example: CSC100A => ['CSC', '100', 'A']
  const [subject, number, suffix] = params.courseId!.split(/(\d+)([A-Z]*)/)
  console.log({ subject, number, suffix })


  const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
  const [startTerm, setStartTerm] = useState<string>('10')
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear())
  const [endTerm, setEndTerm] = useState<string>('90')

  const { data, isLoading } = useLiveQuery((q) =>
    q.from({ courses: coursesCollection })
      .leftJoin({ departments: departmentsCollection }, ({ courses, departments }) =>
        eq(courses.department_code, departments.code)
      )
      .leftJoin({ colleges: collegesCollection }, ({ courses, colleges }) =>
        eq(courses.college_code, colleges.code)
      )
      .leftJoin(
        { studentCourses: studentCoursesCollection }, ({ courses, studentCourses }) =>
        eq([courses.subject, courses.number, courses.suffix], [studentCourses.course_subject, studentCourses.course_number, studentCourses.course_suffix])
      )
      .where(({ courses }) =>
        and(
          eq(courses.subject, subject),
          eq(courses.number, Number(number)),
          eq(courses.suffix, suffix || ''),
        ))
      .where(({ studentCourses }) =>
        and(
          gte(studentCourses?.year, startYear),
          lte(studentCourses?.year, endYear),
          gte(studentCourses?.term_code, startTerm),
          lte(studentCourses?.term_code, endTerm)
        )
      )
      .select(({ courses, departments, colleges, studentCourses }) => ({
        subject: courses.subject,
        number: courses.number,
        suffix: courses.suffix,
        title: courses.title,
        hours: courses.hours,
        last_updated: courses.last_updated,
        department_description: departments?.description,
        college_description: colleges?.description,
        term: studentCourses?.term_code,
        year: studentCourses?.year,
      })),
    [subject, number, suffix, startYear, startTerm, endYear, endTerm]
  )


  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => navigate({
            to: `/enrollment/courses`
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Data Available */}
          {/* {data?.coursesSingle && (
            <EnrollmentTrends
              enrollments={data.coursesSingle.student_courses as Enrollment[]}
              title={`Enrollments for Course ${data.coursesSingle.subject} ${data.coursesSingle.number}${data.coursesSingle.suffix}`}
              description={data.coursesSingle.title || undefined}
            />
          )} */}
        </>
      )}
    </div>
  )
}
