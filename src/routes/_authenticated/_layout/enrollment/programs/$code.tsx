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
import { ProgramCard } from '@/components/program-card'

import { programsCollection } from '@/integrations/tanstack-db/programs'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { studentProgramsCollection } from '@/integrations/tanstack-db/student-programs'

export const Route = createFileRoute(
    '/_authenticated/_layout/enrollment/programs/$code',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({
        from: '/_authenticated/_layout/enrollment/programs/$code',
    })
    const navigate = useNavigate()
    const programCode = params.code

    const [startYear, setStartYear] = useState<number>(new Date().getFullYear())
    const [startTerm, setStartTerm] = useState<string>('10')
    const [endYear, setEndYear] = useState<number>(new Date().getFullYear())
    const [endTerm, setEndTerm] = useState<string>('90')

    const { data: programEnrollment, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ programs: programsCollection })
                .leftJoin(
                    { departments: departmentsCollection },
                    ({ programs, departments }) =>
                        eq(programs.department_id, departments.id),
                )
                .leftJoin(
                    { colleges: collegesCollection },
                    ({ programs, colleges }) =>
                        eq(programs.college_id, colleges.id),
                )
                .leftJoin(
                    { studentPrograms: studentProgramsCollection },
                    ({ programs, studentPrograms }) =>
                        eq(programs.id, studentPrograms.program_id),
                )
                .where(({ programs }) => eq(programs.id, programCode))
                .where(({ studentPrograms }) =>
                    and(
                        gte(studentPrograms?.year, startYear),
                        lte(studentPrograms?.year, endYear),
                        gte(studentPrograms?.term_id, startTerm),
                        lte(studentPrograms?.term_id, endTerm),
                    ),
                )
                .select(
                    ({ programs, departments, colleges, studentPrograms }) => ({
                        id: programs.id,
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
                        term: studentPrograms?.term_id,
                        year: studentPrograms?.year,
                    }),
                ),
        [programCode, startYear, startTerm, endYear, endTerm],
    )

    const exportToCSV = () => {
        if (!programEnrollment || programEnrollment.length === 0) {
            toast.warning(
                'No enrollment data available to export. Try adjusting the date range.',
            )
            return
        }

        // Prepare the data for CSV export
        const csvData = programEnrollment
            .filter((e) => e.term && e.year)
            .map((e) => ({
                'Program Code': e.id,
                Year: e.year,
                Term: e.term,
                Description: e.description || '',
                Department: e.department_description || '',
                College: e.college_description || '',
                'CIP Code': e.cip_code || '',
                'Is Major': e.is_major ? 'Yes' : 'No',
                'Is Minor': e.is_minor ? 'Yes' : 'No',
                'Has Concentration': e.has_concentration ? 'Yes' : 'No',
                'Is AACSB': e.is_aacsb ? 'Yes' : 'No',
                'Is Discontinued': e.is_discontinued ? 'Yes' : 'No',
            }))

        // Convert to CSV
        const csv = Papa.unparse(csvData)

        // Create a blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.setAttribute('href', url)
        link.setAttribute(
            'download',
            `enrollment-${programCode}-${startYear}-${endYear}.csv`,
        )
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="w-full mx-auto p-6 space-y-6">
            <div className="flex flex-col">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        navigate({
                            to: `/enrollment/programs`,
                        })
                    }
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
                exportData={exportToCSV}
            />

            {isLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : (
                <>
                    {/* Data Available */}
                    {programEnrollment && (
                        <div className="max-w-4xl mx-auto">
                            <EnrollmentTrends
                                className="max-w-4xl"
                                enrollments={
                                    programEnrollment
                                        .map((e) => {
                                            if (!e.term || !e.year) {
                                                return false
                                            }

                                            return {
                                                term_code: e.term,
                                                year: e.year,
                                            } as Enrollment
                                        })
                                        .filter(Boolean) as Array<Enrollment>
                                }
                                title={`Enrollments for Program ${programCode}`}
                                description={
                                    programEnrollment[0]?.description ||
                                    undefined
                                }
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
