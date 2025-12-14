import { and, eq, useLiveQuery } from '@tanstack/react-db'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { studentAdvisorsCollection } from '@/integrations/tanstack-db/student-advisors'
import { studentsCollection } from '@/integrations/tanstack-db/students'

type CurrentTerm = {
    year: number
    term_code: string
    description: string | undefined
}

type AdvisedStudentsCardProps = {
    advisorMnumber: string
    term_info: CurrentTerm
    setModalOpen?: (open: boolean) => void
    setSelectedStudent?: (mnumber: string) => void
}

export function AdvisedStudentsCard({
    advisorMnumber,
    term_info,
    setModalOpen,
    setSelectedStudent,
}: AdvisedStudentsCardProps) {
    const { data: advisedStudents } = useLiveQuery((q) =>
        q
            .from({ studentAdvisors: studentAdvisorsCollection })
            .leftJoin(
                { students: studentsCollection },
                ({ studentAdvisors, students }) =>
                    eq(studentAdvisors.student_mnumber, students.mnumber),
            )
            .where(({ studentAdvisors }) =>
                and(
                    eq(studentAdvisors.advisor_mnumber, advisorMnumber),
                    eq(studentAdvisors.year, term_info.year),
                    eq(studentAdvisors.term_code, term_info.term_code),
                ),
            )
            .select(({ students, studentAdvisors }) => ({
                mnumber: students?.mnumber,
                first_name: students?.first_name,
                middle_name: students?.middle_name,
                last_name: students?.last_name,
                suffix: students?.suffix,
                email: students?.email,
                term: studentAdvisors.term_code,
                year: studentAdvisors.year,
            })),
    )

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    {advisedStudents?.length ?? 0} Advised Students
                </CardTitle>
                <CardDescription>
                    Term: {term_info?.description} {term_info.year}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
                <div className="overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>M-Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {advisedStudents && advisedStudents.length > 0 ? (
                                advisedStudents.map((s) => (
                                    <TableRow
                                        key={`advised-student-${s.mnumber}-${s.term}-${s.year}`}
                                        className="cursor-pointer hover:bg-muted/50 transition"
                                        onClick={() => {
                                            setSelectedStudent &&
                                                setSelectedStudent(s.mnumber!)
                                            setModalOpen && setModalOpen(true)
                                        }}
                                    >
                                        <TableCell>{s.mnumber}</TableCell>
                                        <TableCell className="truncate max-w-[120px]">
                                            {`${s.last_name}, ${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''}${s.suffix ? ' ' + s.suffix : ''}`}
                                        </TableCell>
                                        <TableCell className="truncate max-w-[120px]">
                                            {s.email ?? (
                                                <a
                                                    href={`mailto:${s.email}`}
                                                    className="hover:underline"
                                                ></a>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8"
                                    >
                                        No advised students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
