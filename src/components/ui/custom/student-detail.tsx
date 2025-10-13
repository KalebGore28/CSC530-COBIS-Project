import React, { Suspense } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';


// GraphQL imports
import type { studentDetailGetCurrentTermQuery } from './__generated__/studentDetailGetCurrentTermQuery.graphql';
import type { studentDetailQuery } from './__generated__/studentDetailQuery.graphql';
import { graphql, useLazyLoadQuery } from "react-relay";
import { GPATrendChart } from '@/components/charts/gpa-trend-chart';


const studentDetailGetCurrentTermQuery = graphql`
    query studentDetailGetCurrentTermQuery {
        getCurrentYearTerm {
            year
            term
            term_code
        }
    }
`;

const studentDetailQuery = graphql`
query studentDetailQuery($mnumber: String!, $term: String!, $year: Int!) {
  studentsSingle(where: { mnumber: { eq: $mnumber } }) {
    first_name
    last_name
    middle_name
    suffix
    email
    birthdate
    gender
    cell_phone
    race
    residency
    citizenship
    mnumber
    termInfo: academic_info(term: $term, year: $year) {
      admit_code
      academic_standing {
        code
        description
      }
      admit_term {
        code
        description
      }
      admit_year
      msu_attempted_hours
      msu_earned_hours
      msu_gpa
      msu_quality_points
      overall_attempted_hours
      overall_earned_hours
      overall_gpa
      overall_quality_points
    }
    gpaTrend: academic_info {
      msu_gpa
      overall_gpa
      term {
        code
        description
      }
      year
    }
    advisors {
      advisor_mnumber
      term {
        code
        description
      }
      year
      advisor {
        first_name
        last_name
        mnumber
        user {
          email
        }
      }
    }
    programs {
      term {
        code
        description
      }
      year
      type
      level
      program {
        code
        description
      }
    }
  }
}
`;

// Custom skeleton component for loading state
const StudentDetailSkeleton = () => {
    return (
        <div className='flex flex-col gap-4'>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-6 w-1/2" />
                    </CardTitle>
                    <CardDescription>
                        <Skeleton className="h-4 w-3/4" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

// Define the props for the component
interface StudentDetailProps {
    mnumber: string; // The M-Number passed to the component
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ mnumber }) => {
    return (
        <Suspense fallback={<StudentDetailSkeleton />}>
            <StudentDetailContent mnumber={mnumber} />
        </Suspense>
    )
}

export const StudentDetailContent: React.FC<StudentDetailProps> = ({ mnumber }) => {
    // Fetch the current term and year
    const { getCurrentYearTerm } = useLazyLoadQuery<studentDetailGetCurrentTermQuery>(
        studentDetailGetCurrentTermQuery,
        {},
        { fetchPolicy: "store-or-network" }
    );

    // Fetch the student details
    const data = useLazyLoadQuery<studentDetailQuery>(
        studentDetailQuery,
        {
            mnumber,
            term: getCurrentYearTerm?.term_code ?? '',
            year: getCurrentYearTerm?.year ?? 0,
        },
        { fetchPolicy: "store-or-network" }
    );

    // Check if the student data is available
    if (!data.studentsSingle) {
        return (
            <div className='flex flex-col gap-4'>
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Student Not Found</CardTitle>
                        <CardDescription>
                            No student found with M-Number: {mnumber}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const majorPrograms = (data.studentsSingle.programs ?? []).filter(
        (program) => program && program.type === 'MAJOR'
    );

    const minorPrograms = (data.studentsSingle.programs ?? []).filter(
        (program) => program && program.type === 'MINOR'
    );

    return (
        <div className='flex flex-col gap-4'>
            {/* Student Detail Card */}
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                        Basic details for {data.studentsSingle.first_name}{' '}
                        {data.studentsSingle.last_name} (mnumber: {mnumber})
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <strong>Name:</strong> {data.studentsSingle.first_name}{' '}
                        {data.studentsSingle.middle_name} {data.studentsSingle.last_name}{' '}
                        {data.studentsSingle.suffix}
                    </div>
                    <div>
                        <strong>M-Number:</strong> {mnumber}
                    </div>
                    <div>
                        <strong>Email:</strong>{' '}
                        {data.studentsSingle.email ? (
                            <a href={`mailto:${data.studentsSingle.email.toLowerCase()}`} className='hover:underline'>
                                {data.studentsSingle.email.toLowerCase()}
                            </a>
                        ) : (
                            'N/A'
                        )}
                    </div>
                    <div>
                        <strong>Birthdate:</strong> {data.studentsSingle.birthdate ? new Date(data.studentsSingle.birthdate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                        <strong>Gender:</strong>{' '}
                        {data.studentsSingle.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                    <div>
                        <strong>Cellphone:</strong>{' '}
                        {data.studentsSingle.cell_phone || 'N/A'}
                    </div>
                    <div>
                        <strong>Race:</strong> {data.studentsSingle.race} ({data.studentsSingle.race})
                    </div>
                    <div>
                        <strong>Citizenship:</strong>{' '}
                        {data.studentsSingle.citizenship}
                    </div>
                    <div>
                        <strong>Residency:</strong> {data.studentsSingle.residency} ({data.studentsSingle.residency})
                    </div>
                </CardContent>
            </Card>

            {/* Academic Information Card */}
            {data.studentsSingle.termInfo && data.studentsSingle.termInfo.length > 0 &&
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Academic Information</CardTitle>
                        <CardDescription>
                            GPA, hours, standing, and admission details for {getCurrentYearTerm?.term ?? 'N/A'} {getCurrentYearTerm?.year ?? 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                        <div>
                            <strong>MSU GPA:</strong> {data.studentsSingle.termInfo[0]?.msu_gpa ?? 'N/A'}
                        </div>
                        <div>
                            <strong>Overall GPA:</strong> {data.studentsSingle.termInfo[0]?.overall_gpa ?? 'N/A'}
                        </div>
                        <div>
                            <strong>MSU Attempted Hours:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.msu_attempted_hours ?? 'N/A'}
                        </div>
                        <div>
                            <strong>MSU Earned Hours:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.msu_earned_hours ?? 'N/A'}
                        </div>
                        <div>
                            <strong>Overall Attempted Hours:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.overall_attempted_hours ?? 'N/A'}
                        </div>
                        <div>
                            <strong>Overall Earned Hours:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.overall_earned_hours ?? 'N/A'}
                        </div>
                        <div>
                            <strong>Academic Standing:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.academic_standing?.description ?? 'N/A'} ({data.studentsSingle.termInfo[0]?.academic_standing?.code ?? 'N/A'})
                        </div>
                        <div>
                            <strong>Admit Year:</strong>{' '}
                            {data.studentsSingle.termInfo[0]?.admit_year ?? 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            }

            {/* GPA Trend Card */}
            <GPATrendChart gpaTrend={[...data.studentsSingle.gpaTrend]} />

            {/* Programs Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Programs</CardTitle>
                    <CardDescription>Majors and Minors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Majors Table */}
                    <div>
                        <h3 className="text-lg font-semibold">Majors</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Program Code</TableHead>
                                    <TableHead>Program Description</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Term</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {majorPrograms.length > 0 ? (
                                    majorPrograms.map((program, _idx) =>
                                        program && program.program ? (
                                            <TableRow key={program.program.code}>
                                                <TableCell>{program.program.code}</TableCell>
                                                <TableCell>{program.program.description}</TableCell>
                                                <TableCell>{program.level}</TableCell>
                                                <TableCell>{program.type}</TableCell>
                                                <TableCell>
                                                    {program.term.description} {program.year}
                                                </TableCell>
                                            </TableRow>
                                        ) : null
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No majors to display
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Minors Table */}
                    <div>
                        <h3 className="text-lg font-semibold">Minors</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Program Code</TableHead>
                                    <TableHead>Program Description</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Term</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {minorPrograms.length > 0 ? (
                                    minorPrograms.map((program) =>
                                        program && program.program ? (
                                            <TableRow key={program.program.code}>
                                                <TableCell>{program.program.code}</TableCell>
                                                <TableCell>{program.program.description}</TableCell>
                                                <TableCell>{program.level}</TableCell>
                                                <TableCell>{program.type}</TableCell>
                                                <TableCell>
                                                    {program.term.description} {program.year}
                                                </TableCell>
                                            </TableRow>
                                        ) : null
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No minors to display
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Advisors Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Advisors</CardTitle>
                    <CardDescription>All advisors for this student</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>M-Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Term</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(data.studentsSingle.advisors ?? []).map((advisor) =>
                                advisor && advisor.advisor ? (
                                    <TableRow key={advisor.advisor_mnumber}>
                                        <TableCell>{advisor.advisor_mnumber}</TableCell>
                                        <TableCell>
                                            {advisor.advisor.first_name} {advisor.advisor.last_name}
                                        </TableCell>
                                        <TableCell>
                                            <a href={`mailto:${advisor.advisor.user?.email || ''}`} className='hover:underline'>
                                                {advisor.advisor.user?.email || 'N/A'}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {advisor.term.description} {advisor.year}
                                        </TableCell>
                                    </TableRow>
                                ) : null
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}