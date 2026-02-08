import { eq, useLiveQuery } from '@tanstack/react-db'
import { ProgramTable } from './program-table'
import { AdvisorTable } from './advisor-table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { GPATrendChart } from '@/components/charts/gpa-trend-chart'

import { termsCollection } from '@/integrations/tanstack-db/terms'
import { programsCollection } from '@/integrations/tanstack-db/programs'
import { studentsCollection } from '@/integrations/tanstack-db/students'
import { usersCollection } from '@/integrations/tanstack-db/users'
import { studentAcademicInfoCollection } from '@/integrations/tanstack-db/student-academic-info'
import { studentAdvisorsCollection } from '@/integrations/tanstack-db/student-advisors'
import { academicStandingCollection } from '@/integrations/tanstack-db/academic-standing'
import { studentProgramsCollection } from '@/integrations/tanstack-db/student-programs'

type StudentDetailProps = {
    studentMnumber: string
    modalOpen: boolean
    setModalOpen: (open: boolean) => void
}

export function StudentDetailModal({
    studentMnumber,
    modalOpen,
    setModalOpen,
}: StudentDetailProps) {
    const { data: studentDetails } = useLiveQuery(
        (q) =>
            q
                .from({ student: studentsCollection })
                .where(({ student }) => eq(student.mnumber, studentMnumber))
                .findOne(),
        [studentMnumber],
    )

    const { data: academicInfo } = useLiveQuery(
        (q) =>
            q
                .from({ academicInfo: studentAcademicInfoCollection })
                .leftJoin({ term: termsCollection }, ({ academicInfo, term }) =>
                    eq(academicInfo.term_id, term.id),
                )
                .leftJoin(
                    { standing: academicStandingCollection },
                    ({ academicInfo, standing }) =>
                        eq(academicInfo.academic_standing_id, standing.id),
                )
                .where(({ academicInfo }) =>
                    eq(academicInfo.mnumber, studentMnumber),
                )
                .select(({ academicInfo, term, standing }) => ({
                    msu_gpa: academicInfo.msu_gpa,
                    overall_gpa: academicInfo.overall_gpa,
                    msu_attempted_hours: academicInfo.msu_attempted_hours,
                    msu_earned_hours: academicInfo.msu_earned_hours,
                    overall_attempted_hours:
                        academicInfo.overall_attempted_hours,
                    overall_earned_hours: academicInfo.overall_earned_hours,
                    academic_standing_description: standing?.description,
                    admit_year: academicInfo.admit_year,
                    term_id: academicInfo.term_id,
                    term_description: term?.description,
                    year: academicInfo.year,
                }))
                .orderBy(({ academicInfo }) => academicInfo.year, 'desc')
                .orderBy(({ academicInfo }) => academicInfo.term_id, 'desc')
                .limit(10),
        [studentMnumber],
    )

    const { data: studentPrograms } = useLiveQuery(
        (q) =>
            q
                .from({ studentProgram: studentProgramsCollection })
                .leftJoin(
                    { term: termsCollection },
                    ({ studentProgram, term }) =>
                        eq(studentProgram.term_id, term.id),
                )
                .leftJoin(
                    { program: programsCollection },
                    ({ studentProgram, program }) =>
                        eq(studentProgram.program_id, program.id),
                )
                .where(({ studentProgram }) =>
                    eq(studentProgram.mnumber, studentMnumber),
                )
                .select(({ studentProgram, program, term }) => ({
                    program_code: studentProgram.program_id,
                    program_description: program?.description,
                    program_level: studentProgram.level,
                    program_type: studentProgram.type,
                    term_description: term?.description,
                    year: studentProgram.year,
                }))
                .orderBy(({ studentProgram }) => studentProgram.year, 'desc')
                .orderBy(({ studentProgram }) => studentProgram.term_id, 'desc')
                .limit(4),
        [studentMnumber],
    )

    const { data: studentAdvisors } = useLiveQuery(
        (q) =>
            q
                .from({ studentAdvisor: studentAdvisorsCollection })
                .leftJoin(
                    { term: termsCollection },
                    ({ studentAdvisor, term }) =>
                        eq(studentAdvisor.term_id, term.id),
                )
                .leftJoin(
                    { user: usersCollection },
                    ({ studentAdvisor, user }) =>
                        eq(studentAdvisor.advisor_mnumber, user.mnumber),
                )
                .where(({ studentAdvisor }) =>
                    eq(studentAdvisor.mnumber, studentMnumber),
                )
                .select(({ studentAdvisor, term, user }) => ({
                    advisor_mnumber: studentAdvisor.advisor_mnumber,
                    advisor_name: user?.name,
                    advisor_email: user?.email,
                    term_description: term?.description,
                    year: studentAdvisor.year,
                }))
                .orderBy(({ studentAdvisor }) => studentAdvisor.year, 'desc')
                .orderBy(({ studentAdvisor }) => studentAdvisor.term_id, 'desc')
                .limit(4),
        [studentMnumber],
    )

    return (
        <Dialog
            open={modalOpen}
            onOpenChange={(open) => {
                if (!open) setModalOpen(false)
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Student Detail</DialogTitle>
                    <DialogDescription>
                        Detailed academic information for{' '}
                        {studentDetails?.first_name} {studentDetails?.last_name}{' '}
                        ({studentMnumber})
                    </DialogDescription>
                </DialogHeader>
                <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4 space-y-4">
                    {/* Student Detail Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Information</CardTitle>
                            <CardDescription>
                                GPA, hours, standing, and admission details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                            <div>
                                <strong>MSU GPA:</strong>{' '}
                                {academicInfo?.[0]?.msu_gpa || 'N/A'}
                            </div>
                            <div>
                                <strong>Overall GPA:</strong>{' '}
                                {academicInfo?.[0]?.overall_gpa || 'N/A'}
                            </div>
                            <div>
                                <strong>MSU Attempted Hours:</strong>{' '}
                                {academicInfo?.[0]?.msu_attempted_hours ||
                                    'N/A'}
                            </div>
                            <div>
                                <strong>MSU Earned Hours:</strong>{' '}
                                {academicInfo?.[0]?.msu_earned_hours || 'N/A'}
                            </div>
                            <div>
                                <strong>Overall Attempted Hours:</strong>{' '}
                                {academicInfo?.[0]?.overall_attempted_hours ||
                                    'N/A'}
                            </div>
                            <div>
                                <strong>Overall Earned Hours:</strong>{' '}
                                {academicInfo?.[0]?.overall_earned_hours ||
                                    'N/A'}
                            </div>
                            <div>
                                <strong>Academic Standing:</strong>{' '}
                                {academicInfo?.[0]
                                    ?.academic_standing_description || ''}
                            </div>
                            <div>
                                <strong>Admit Year:</strong>{' '}
                                {academicInfo?.[0]?.admit_year || 'N/A'}
                            </div>
                        </CardContent>
                    </Card>

                    {/* GPA Trend Card */}
                    <GPATrendChart
                        gpaTrend={academicInfo
                            .map((info) => {
                                return {
                                    term_id: info.term_id,
                                    year: info.year,
                                    year_term: `${info.term_description} ${info.year}`,
                                    msu_gpa: info.msu_gpa || 0,
                                    overall_gpa: info.overall_gpa || 0,
                                }
                            })
                            .sort((a, b) =>
                                `${a.year}-${a.term_id}`.localeCompare(
                                    `${b.year}-${b.term_id}`,
                                ),
                            )}
                    />

                    {/* Programs Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Majors & Minors</CardTitle>
                            <CardDescription>
                                List of student's majors and minors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center overflow-x-auto max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                            <ProgramTable
                                data={studentPrograms.map((program) => ({
                                    id: program.program_code,
                                    description:
                                        program.program_description ||
                                        'Unknown',
                                    level: program.program_level || 'Unknown',
                                    type: program.program_type || 'Unknown',
                                    year_term: `${program.term_description} ${program.year}`,
                                }))}
                            />
                        </CardContent>
                    </Card>

                    {/* Advisors Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Advisors</CardTitle>
                            <CardDescription>
                                List of student's advisors.
                            </CardDescription>
                            <CardContent className="flex justify-center overflow-x-auto max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
                                <AdvisorTable
                                    data={studentAdvisors.map((advisor) => ({
                                        id: `advisor-${advisor.advisor_mnumber}-${advisor.year}-${advisor.term_description}`,
                                        mnumber:
                                            advisor.advisor_mnumber ||
                                            'Unknown',
                                        name: advisor.advisor_name || 'Unknown',
                                        email:
                                            advisor.advisor_email || 'Unknown',
                                        year_term: `${advisor.term_description} ${advisor.year}`,
                                    }))}
                                />
                            </CardContent>
                        </CardHeader>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
