// src/components/StudentDetail.tsx

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

export interface StudentInfo {
    mnumber: string;
    firstName: string;
    middleName?: string; // Optional fields marked with ?
    lastName: string;
    suffix?: string;
    gender: string;
    birthdate: string; // Consider using Date type if you parse it
    email: string;
    cellPhone?: string;
    age: number;
    race: string;
    citizenship: string;
    residency: string;
}

export interface AcademicInfo {
    msuGpa: number;
    overallGpa: number;
    msuAttemptedHours: number;
    msuEarnedHours: number;
    overallAttemptedHours: number;
    overallEarnedHours: number;
    academicStanding: string;
    academicStandingDescription: string;
    admitTerm: string;
    admitTermDescription: string;
    admitYear: number;
    admitCode: string;
    admitCodeDescription: string;
}

export interface Program {
    code: string;
    description: string;
    department: string;
    college: string;
    level: string;
    term: string;
    termDescription: string;
    year: number;
}

export interface Programs {
    majors: Program[];
    minors: Program[];
}

export interface Advisor {
    mnumber: string;
    term: string;
    termDescription: string;
    year: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface StudentDetailData {
    studentInfo: StudentInfo;
    academicInfo: AcademicInfo;
    programs: Programs;
    advisors: Advisor[];
}


// Import Shadcn UI components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'; // Adjust path if needed
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'; // Adjust path if needed
import { Skeleton } from '@/components/ui/skeleton'; // Adjust path if needed
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Adjust path if needed
import { AlertTriangle } from 'lucide-react'; // Icon for alert

// Define the props for the component
interface StudentDetailProps {
    mnumber: string; // The M-Number passed to the component
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ mnumber }) => {
    // State for storing the fetched student data
    const [studentData, setStudentData] = useState<StudentDetailData | null>(
        null
    );
    // State to track loading status
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // State to store any potential error during fetch
    const [error, setError] = useState<string | null>(null);

    // useEffect hook to fetch data when the component mounts or mnumber changes
    useEffect(() => {
        // Function to fetch student details
        const fetchStudentDetails = async () => {
            setIsLoading(true); // Start loading
            setError(null); // Reset error state
            setStudentData(null); // Reset previous data

            // Make sure mnumber is provided before fetching
            if (!mnumber) {
                setError('M-Number is required.');
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get<StudentDetailData>(`/api/student/${mnumber}`, {
                    withCredentials: true,
                });

                // Check if data was received
                if (response.data) {
                    setStudentData(response.data); // Store the fetched data
                } else {
                    setError('No data received from the server.'); // Handle empty response
                }
            } catch (err) {
                console.error('Error fetching student details:', err); // Log the error details
                if (axios.isAxiosError(err)) {
                    const axiosError = err as AxiosError;
                    if (axiosError.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        setError(
                            `Failed to fetch data: Server responded with status ${axiosError.response.status}`
                        );
                    } else if (axiosError.request) {
                        // The request was made but no response was received
                        setError(
                            'Failed to fetch data: No response from server. Is the API running?'
                        );
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        setError(`Failed to fetch data: ${axiosError.message}`);
                    }
                } else {
                    // Handle non-Axios errors
                    setError('An unexpected error occurred.');
                }
            } finally {
                setIsLoading(false); // Stop loading regardless of success or failure
            }
        };

        fetchStudentDetails(); // Execute the fetch function

        // Dependency array: The effect runs again if `mnumber` changes
    }, [mnumber]);

    // --- Render Loading State ---
    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    // --- Render Error State ---
    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // --- Render No Data State ---
    // This condition might be hit if the API returns successfully but with null/empty data
    if (!studentData) {
        return (
            <Alert className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>
                    Could not find details for M-Number: {mnumber}.
                </AlertDescription>
            </Alert>
        );
    }

    // --- Render Successful Data ---
    const { studentInfo, academicInfo, programs, advisors } = studentData;

    return (
        <div className="space-y-6 p-4">
            {/* Student Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                        Basic details for {studentInfo.firstName}{' '}
                        {studentInfo.lastName} ({studentInfo.mnumber})
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <strong>Name:</strong> {studentInfo.firstName}{' '}
                        {studentInfo.middleName} {studentInfo.lastName}{' '}
                        {studentInfo.suffix}
                    </div>
                    <div>
                        <strong>M-Number:</strong> {studentInfo.mnumber}
                    </div>
                    <div>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${studentInfo.email.toLowerCase()}`} className='hover:underline'>
                            {studentInfo.email.toLowerCase()}
                        </a>
                    </div>
                    <div>
                        <strong>Birthdate:</strong> {new Date(studentInfo.birthdate).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Age:</strong> {studentInfo.age}
                    </div>
                    <div>
                        <strong>Gender:</strong>{' '}
                        {studentInfo.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                    <div>
                        <strong>Cellphone:</strong>{' '}
                        {studentInfo.cellPhone || 'N/A'}
                    </div>
                    <div>
                        <strong>Race:</strong> {studentInfo.race}
                    </div>
                    <div>
                        <strong>Citizenship:</strong>{' '}
                        {studentInfo.citizenship === 'Y' ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <strong>Residency:</strong> {studentInfo.residency}
                    </div>
                </CardContent>
            </Card>

            {/* Academic Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Academic Information</CardTitle>
                    <CardDescription>
                        GPA, hours, standing, and admission details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div>
                        <strong>MSU GPA:</strong> {academicInfo.msuGpa}
                    </div>
                    <div>
                        <strong>Overall GPA:</strong> {academicInfo.overallGpa}
                    </div>
                    <div>
                        <strong>MSU Attempted Hours:</strong>{' '}
                        {academicInfo.msuAttemptedHours}
                    </div>
                    <div>
                        <strong>MSU Earned Hours:</strong>{' '}
                        {academicInfo.msuEarnedHours}
                    </div>
                    <div>
                        <strong>Overall Attempted Hours:</strong>{' '}
                        {academicInfo.overallAttemptedHours}
                    </div>
                    <div>
                        <strong>Overall Earned Hours:</strong>{' '}
                        {academicInfo.overallEarnedHours}
                    </div>
                    <div>
                        <strong>Academic Standing:</strong>{' '}
                        {academicInfo.academicStandingDescription} (
                        {academicInfo.academicStanding})
                    </div>
                    <div>
                        <strong>Admit Term:</strong>{' '}
                        {academicInfo.admitTermDescription} {academicInfo.admitYear}
                    </div>
                    <div>
                        <strong>Admit Code:</strong> {' '}
                        {academicInfo.admitCodeDescription} ({academicInfo.admitCode})
                    </div>
                </CardContent>
            </Card>

            {/* Programs Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Programs</CardTitle>
                    <CardDescription>Majors and Minors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Majors Table */}
                    <div>
                        <h4 className="mb-2 text-lg font-semibold">Majors</h4>
                        {programs.majors && programs.majors.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Term</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs.majors.map((major: Program) => (
                                        <TableRow key={major.code}>
                                            <TableCell>{major.code}</TableCell>
                                            <TableCell>
                                                {major.description}
                                            </TableCell>
                                            <TableCell>
                                                {major.department}
                                            </TableCell>
                                            <TableCell>{major.college}</TableCell>
                                            <TableCell>{major.level}</TableCell>
                                            <TableCell>
                                                {major.termDescription} {major.year}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No majors listed.
                            </p>
                        )}
                    </div>

                    {/* Minors Table */}
                    <div>
                        <h4 className="mb-2 text-lg font-semibold">Minors</h4>
                        {programs.minors && programs.minors.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Term</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {programs.minors.map((minor: Program) => (
                                        <TableRow key={minor.code}>
                                            <TableCell>{minor.code}</TableCell>
                                            <TableCell>
                                                {minor.description}
                                            </TableCell>
                                            <TableCell>
                                                {minor.department}
                                            </TableCell>
                                            <TableCell>{minor.college}</TableCell>
                                            <TableCell>{minor.level}</TableCell>
                                            <TableCell>
                                                {minor.termDescription} {minor.year}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No minors listed.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advisors Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Advisors</CardTitle>
                    <CardDescription>Assigned advisors.</CardDescription>
                </CardHeader>
                <CardContent>
                    {advisors && advisors.length > 0 ? (
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
                                {advisors.map((advisor: Advisor, index) => (
                                    // Added index to key for advisors as mnumber/term might not be unique in edge cases
                                    <TableRow
                                        key={`${advisor.mnumber}-${advisor.year}${advisor.term}-${index}`}
                                    >
                                        <TableCell>{advisor.mnumber}</TableCell>
                                        <TableCell>
                                            {advisor.firstName} {advisor.lastName}
                                        </TableCell>
                                        <TableCell>
                                            {/* Make sure email doesnt say not available */}
                                            {advisor.email && advisor.email !== 'Not Available' ? (
                                                <a
                                                    href={`mailto:${advisor.email.toLowerCase()}`}
                                                    className="hover:underline"
                                                >
                                                    {advisor.email.toLowerCase()}
                                                </a>
                                            ) : (
                                                'Not Available'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {advisor.termDescription} {advisor.year}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No advisors listed.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentDetail;