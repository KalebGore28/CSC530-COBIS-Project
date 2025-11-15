import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { type Enrollment, EnrollmentTrends } from '@/components/charts/enrollment-trends';
import { ProgramCard } from '@/components/program-card';

import { programsCollection } from '@/collections/programs';
import { departmentsCollection } from '@/collections/departments';
import { collegesCollection } from '@/collections/colleges';
import { studentProgramsCollection } from '@/collections/student-programs';
import { useLiveQuery, eq, and, gte, lte } from '@tanstack/react-db';

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/programs/$code',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/enrollment/programs/$code' })
  const navigate = useNavigate()
  const programCode = params.code!

  const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
  const [startTerm, setStartTerm] = useState<string>('10')
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear())
  const [endTerm, setEndTerm] = useState<string>('90')

  const { data: programEnrollment, isLoading } = useLiveQuery((q) =>
    q.from({ programs: programsCollection })
      .leftJoin({ departments: departmentsCollection }, ({ programs, departments }) =>
        eq(programs.department_code, departments.code)
      )
      .leftJoin({ colleges: collegesCollection }, ({ programs, colleges }) =>
        eq(programs.college_code, colleges.code)
      )
      .leftJoin(
        { studentPrograms: studentProgramsCollection }, ({ programs, studentPrograms }) =>
        eq(programs.code, studentPrograms.program_code)
      )
      .where(({ programs }) => eq(programs.code, programCode))
      .where(({ studentPrograms }) =>
        and(
          gte(studentPrograms?.year, startYear),
          lte(studentPrograms?.year, endYear),
          gte(studentPrograms?.term_code, startTerm),
          lte(studentPrograms?.term_code, endTerm)
        )
      )
      .select(({ programs, departments, colleges, studentPrograms }) => ({
        code: programs.code,
        has_concentration: programs.has_concentration,
        is_aacsb: programs.is_aacsb,
        is_discontinued: programs.is_discontinued,
        is_major: programs.is_major,
        is_minor: programs.is_minor,
        cip_code: programs.cip_code,
        last_updated: programs.last_updated,
        description: programs.description,
        department_description: departments?.description,
        college_description: colleges?.description,
        term: studentPrograms?.term_code,
        year: studentPrograms?.year,
      })),
    [programCode, startYear, startTerm, endYear, endTerm]
  )

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => navigate({
            to: `/enrollment/programs`
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programs
        </Button>
      </div>

      <ProgramCard
        programCode={programCode}
        startYear={startYear}
        startTerm={startTerm}
        endYear={endYear}
        endTerm={endTerm}
        setStartYear={setStartYear}
        setStartTerm={setStartTerm}
        setEndYear={setEndYear}
        setEndTerm={setEndTerm}
        exportData={() => { }}
      />


      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Data Available */}
          {programEnrollment && (
            <div className="max-w-4xl mx-auto">
              <EnrollmentTrends
                className='max-w-4xl'
                enrollments={programEnrollment.map(e => {
                  if (!e.term || !e.year) {
                    return false
                  }

                  return {
                    term_code: e.term!,
                    year: e.year!,
                  } as Enrollment

                }).filter(Boolean) as Enrollment[]}
                title={`Enrollments for Program ${programCode}`}
                description={programEnrollment[0]?.description || undefined}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
