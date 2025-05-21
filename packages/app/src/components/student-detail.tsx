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


// GraphQL imports
import type { studentDetailGetCurrentTermQuery } from './__generated__/studentDetailGetCurrentTermQuery.graphql';
import type { studentDetailQuery } from './__generated__/studentDetailQuery.graphql';
import { graphql, useLazyLoadQuery } from "react-relay";
import { GPATrendChart } from './charts/gpa-trend-chart';


const studentDetailGetCurrentTermQuery = graphql`
    query studentDetailGetCurrentTermQuery {
        getCurrentYearTerm {
            year
            term {
                code
                description
            }
        }
    }
`;

const studentDetailQuery = graphql`
    query studentDetailQuery($mnumber: String!, $term: String, $year: Int) {
    student(mnumber: $mnumber) {
        first_name
        last_name
        middle_name
        suffix
        email
        birthdate
        age
        gender
        cell_phone
        race_code
        race_description
        residency_code
        residency_description
        citizenship
        termInfo: academic_info(term: $term, year: $year) {
            admit_code {
                code
                description
            }
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

// Define the props for the component
interface StudentDetailProps {
    mnumber: string; // The M-Number passed to the component
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ mnumber }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
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
            term: getCurrentYearTerm.term.code,
            year: getCurrentYearTerm.year,
        },
        { fetchPolicy: "store-or-network" }
    );

    // Check if the student data is available
    if (!data.student) {
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

    const majorPrograms = data.student.programs.filter(
        (program) => program.type === 'MAJOR'
    );

    const minorPrograms = data.student.programs.filter(
        (program) => program.type === 'MINOR'
    );

    return (
        <div className='flex flex-col gap-4'>
            {/* Student Detail Card */}
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                        Basic details for {data.student.first_name}{' '}
                        {data.student.last_name} (mnumber: {mnumber})
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <strong>Name:</strong> {data.student.first_name}{' '}
                        {data.student.middle_name} {data.student.last_name}{' '}
                        {data.student.suffix}
                    </div>
                    <div>
                        <strong>M-Number:</strong> {mnumber}
                    </div>
                    <div>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${data.student.email.toLowerCase()}`} className='hover:underline'>
                            {data.student.email.toLowerCase()}
                        </a>
                    </div>
                    <div>
                        <strong>Birthdate:</strong> {new Date(data.student.birthdate).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Age:</strong> {data.student.age}
                    </div>
                    <div>
                        <strong>Gender:</strong>{' '}
                        {data.student.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                    <div>
                        <strong>Cellphone:</strong>{' '}
                        {data.student.cell_phone || 'N/A'}
                    </div>
                    <div>
                        <strong>Race:</strong> {data.student.race_description} ({data.student.race_code})
                    </div>
                    <div>
                        <strong>Citizenship:</strong>{' '}
                        {data.student.citizenship === 'Y' ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <strong>Residency:</strong> {data.student.residency_description} ({data.student.residency_code})
                    </div>
                </CardContent>
            </Card>

            {/* Academic Information Card */}
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>Academic Information</CardTitle>
                    <CardDescription>
                        GPA, hours, standing, and admission details for {getCurrentYearTerm.term.description} {getCurrentYearTerm.year}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <strong>MSU GPA:</strong> {data.student.termInfo[0].msu_gpa}
                    </div>
                    <div>
                        <strong>Overall GPA:</strong> {data.student.termInfo[0].overall_gpa}
                    </div>
                    <div>
                        <strong>MSU Attempted Hours:</strong>{' '}
                        {data.student.termInfo[0].msu_attempted_hours}
                    </div>
                    <div>
                        <strong>MSU Earned Hours:</strong>{' '}
                        {data.student.termInfo[0].msu_earned_hours}
                    </div>
                    <div>
                        <strong>Overall Attempted Hours:</strong>{' '}
                        {data.student.termInfo[0].overall_attempted_hours}
                    </div>
                    <div>
                        <strong>Overall Earned Hours:</strong>{' '}
                        {data.student.termInfo[0].overall_earned_hours}
                    </div>
                    <div>
                        <strong>Academic Standing:</strong>{' '}
                        {data.student.termInfo[0].academic_standing.description} (
                        {data.student.termInfo[0].academic_standing.code})
                    </div>
                    <div>
                        <strong>Admit Term:</strong>{' '}
                        {data.student.termInfo[0].admit_term.description} {data.student.termInfo[0].admit_year}
                    </div>
                    <div>
                        <strong>Admit Code:</strong> {' '}
                        {data.student.termInfo[0].admit_code.description} ({data.student.termInfo[0].admit_term.code})
                    </div>
                </CardContent>
            </Card>

            {/* GPA Trend Card */}
            <GPATrendChart gpaTrend={[...data.student.gpaTrend]} />

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
                                    majorPrograms.map((program) => (
                                        <TableRow key={program.program.code}>
                                            <TableCell>{program.program.code}</TableCell>
                                            <TableCell>{program.program.description}</TableCell>
                                            <TableCell>{program.level}</TableCell>
                                            <TableCell>{program.type}</TableCell>
                                            <TableCell>
                                                {program.term.description} {program.year}
                                            </TableCell>
                                        </TableRow>
                                    ))
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
                                    minorPrograms.map((program) => (
                                        <TableRow key={program.program.code}>
                                            <TableCell>{program.program.code}</TableCell>
                                            <TableCell>{program.program.description}</TableCell>
                                            <TableCell>{program.level}</TableCell>
                                            <TableCell>{program.type}</TableCell>
                                            <TableCell>
                                                {program.term.description} {program.year}
                                            </TableCell>
                                        </TableRow>
                                    ))
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
                    <CardDescription>Advisors for {getCurrentYearTerm.term.description} {getCurrentYearTerm.year}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>M-Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Term</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.student.advisors.map((advisor) => (
                                <TableRow key={advisor.advisor_mnumber}>
                                    <TableCell>{advisor.advisor_mnumber}</TableCell>
                                    <TableCell>
                                        {advisor.advisor.first_name} {advisor.advisor.last_name}
                                    </TableCell>
                                    <TableCell>
                                        {advisor.term.description} {advisor.year}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}