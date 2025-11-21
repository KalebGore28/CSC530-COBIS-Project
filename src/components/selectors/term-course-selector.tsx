import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { termsCollection } from "@/collections/terms";
import { coursesCollection } from "@/collections/courses";
import { studentCoursesCollection } from "@/collections/student-courses";
import { useLiveQuery, eq, count, sum } from '@tanstack/react-db';
import { useState, useEffect } from "react";


type SelectedTerm = {
    year: number;
    term_code: string;
    term_description?: string;
    studentCount: number;
    creditHoursDelivered: number;
}

export type SelectedCourse = {
    course_id: string;
    course_section: string;
    course_title?: string;
    year: number;
    term_code: string;
    term_description?: string;
    student_count: number;
    credit_hours_delivered: number;
}

type TermCourseSelectorProps = {
    mnumber: string;
    showStats?: boolean;
    className?: string;
    selectedCourseChanged?: (course: SelectedCourse) => SelectedCourse | void;
}
export function TermCourseSelector({ mnumber, showStats, className, selectedCourseChanged }: TermCourseSelectorProps) {
    const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Term & Course Selector</CardTitle>
                <CardDescription>Select a term and course to view the class roster.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Term Selector Component */}
                <TermSelector
                    mnumber={mnumber}
                    showStats={showStats}
                    setSelectedTerm={setSelectedTerm}
                    selectedTerm={selectedTerm || undefined}
                />
                {/* Course Selector Component */}
                {selectedTerm && (
                    <CourseSelector
                        mnumber={mnumber}
                        showStats={showStats}
                        selectedTerm={selectedTerm}
                        selectedCourse={selectedCourse || undefined}
                        onCourseSelect={(value) => {
                            setSelectedCourse(value);
                            selectedCourseChanged && selectedCourseChanged(value);
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}

type TermSelectorProps = {
    mnumber: string;
    showStats?: boolean;
    selectedTerm?: SelectedTerm;
    setSelectedTerm?: (term: SelectedTerm) => void;
}

function TermSelector({ mnumber, showStats, selectedTerm, setSelectedTerm }: TermSelectorProps) {
    const { data: instructorTerms, isLoading, isReady } = useLiveQuery((q) =>
        q.from({ studentCourse: studentCoursesCollection })
            .leftJoin({ term: termsCollection }, ({ studentCourse, term }) =>
                eq(studentCourse.term_code, term.code)
            )
            .where(({ studentCourse }) => eq(studentCourse.instructor_mnumber, mnumber))
            .select(({ studentCourse, term }) => ({
                year: studentCourse.year,
                term_code: studentCourse.term_code,
                term_description: term?.description,
                student_count: count(studentCourse.mnumber),
                credit_hours_delivered: sum(studentCourse.course_hours),
            }))
            .groupBy(({ studentCourse, term }) => [studentCourse.year, studentCourse.term_code, term?.description])
            .distinct()
    )

    // Runs once to set default selection to first term if none selected
    useEffect(() => {
        if (!isReady || isLoading) return;
        if (!selectedTerm && instructorTerms && instructorTerms.length > 0) {
            const firstTerm = instructorTerms[0];
            setSelectedTerm && setSelectedTerm({
                year: firstTerm.year,
                term_code: firstTerm.term_code,
                term_description: firstTerm.term_description,
                studentCount: firstTerm.student_count || 0,
                creditHoursDelivered: firstTerm.credit_hours_delivered || 0,
            });
        }
    }, [instructorTerms, isLoading]);

    if (isLoading || !instructorTerms || instructorTerms.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                    {showStats && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Skeleton className="h-5 w-24 mt-2" />
                            <Skeleton className="h-5 w-28 mt-2" />
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent>
                <Select
                    value={selectedTerm ? `${selectedTerm.year}-${selectedTerm.term_code}` : "Select Term"}
                    onValueChange={(value) => {
                        const [year, term_code] = value.split("-");

                        // Get the selected term object
                        const selectedTermObj = instructorTerms?.find((term =>
                            term.year === Number(year) && term.term_code === term_code
                        ));

                        setSelectedTerm && setSelectedTerm({
                            year: Number(year),
                            term_code: term_code,
                            term_description: selectedTermObj?.term_description,
                            studentCount: selectedTermObj ? selectedTermObj.student_count : 0,
                            creditHoursDelivered: selectedTermObj ? selectedTermObj.credit_hours_delivered : 0,
                        });
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                        {instructorTerms?.map((term, index) => (
                            <SelectItem key={index} value={`${term.year}-${term.term_code}`}>
                                {term.term_description} {term.year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            {showStats && selectedTerm && (
                <CardFooter className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900">
                        {selectedTerm.studentCount}{" "}
                        {selectedTerm.studentCount === 1 ? "Student" : "Students"}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
                        {selectedTerm.creditHoursDelivered} Credit Hours
                    </Badge>
                </CardFooter>
            )}
        </Card>
    )

}

type CourseSelectorProps = {
    mnumber: string;
    showStats?: boolean;
    selectedTerm: SelectedTerm;
    selectedCourse?: SelectedCourse; // Replace 'any' with actual course type
    onCourseSelect?: (course: SelectedCourse) => void; // Replace 'any' with actual course type
}

function CourseSelector({ mnumber, showStats, selectedTerm, selectedCourse, onCourseSelect }: CourseSelectorProps) {
    const { data: instructorCourses, isLoading, isReady } = useLiveQuery((q) =>
        q.from({ studentCourse: studentCoursesCollection })
            .leftJoin({ term: termsCollection }, ({ studentCourse, term }) =>
                eq(studentCourse.term_code, term.code)
            )
            .leftJoin({ course: coursesCollection }, ({ studentCourse, course }) =>
                eq(studentCourse.course_id, course.code)
            )
            .where(({ studentCourse }) => eq(studentCourse.instructor_mnumber, mnumber))
            .where(({ studentCourse }) => eq(studentCourse.year, selectedTerm.year))
            .where(({ studentCourse }) => eq(studentCourse.term_code, selectedTerm.term_code))
            .select(({ studentCourse, term, course }) => ({
                course_id: studentCourse.course_id,
                course_section: studentCourse.course_section,
                course_title: course?.title,
                year: studentCourse.year,
                term_code: studentCourse.term_code,
                term_description: term?.description,
                student_count: count(studentCourse.mnumber),
                credit_hours_delivered: sum(studentCourse.course_hours),
            }))
            .groupBy(({ studentCourse, term, course }) => [
                studentCourse.course_id,
                studentCourse.course_section,
                course?.title,
                studentCourse.year,
                studentCourse.term_code,
                term?.description,
            ])
            .distinct()
    )

    // Runs once to set default selection to first course if none selected
    useEffect(() => {
        if (!isReady || isLoading) return;
        if (!selectedCourse && instructorCourses && instructorCourses.length > 0) {
            const firstCourse = instructorCourses[0];
            onCourseSelect && onCourseSelect({
                course_id: firstCourse.course_id,
                course_section: firstCourse.course_section,
                course_title: firstCourse.course_title,
                year: firstCourse.year,
                term_code: firstCourse.term_code,
                term_description: firstCourse.term_description,
                student_count: firstCourse.student_count || 0,
                credit_hours_delivered: firstCourse.credit_hours_delivered || 0,
            });
        }
    }, [instructorCourses, isLoading]);

    if (isLoading || !instructorCourses || instructorCourses.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                    {showStats && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Skeleton className="h-5 w-24 mt-2" />
                            <Skeleton className="h-5 w-28 mt-2" />
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent>
                <Select
                    value={selectedCourse ? `${selectedCourse.course_id}-${selectedCourse.course_section}` : "Select Course"}
                    onValueChange={(value) => {
                        const [course_id, course_section] = value.split("-");

                        // Get the selected course object
                        const selectedCourseObj = instructorCourses?.find((course =>
                            course.course_id === course_id && course.course_section === course_section
                        ));

                        onCourseSelect && onCourseSelect({
                            course_id: course_id,
                            course_section: course_section,
                            course_title: selectedCourseObj?.course_title,
                            year: selectedCourseObj ? selectedCourseObj.year : 0,
                            term_code: selectedCourseObj ? selectedCourseObj.term_code : "",
                            term_description: selectedCourseObj?.term_description,
                            student_count: selectedCourseObj ? selectedCourseObj.student_count : 0,
                            credit_hours_delivered: selectedCourseObj ? selectedCourseObj.credit_hours_delivered : 0,
                        });
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                        {instructorCourses?.map((course, index) => (
                            <SelectItem key={index} value={`${course.course_id}-${course.course_section}`}>
                                {course.course_title} ({course.course_id}-{course.course_section})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            {showStats && selectedCourse && (
                <CardFooter className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900">
                        {selectedCourse.student_count}{" "}
                        {selectedCourse.student_count === 1 ? "Student" : "Students"}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
                        {selectedCourse.credit_hours_delivered} Credit Hours
                    </Badge>
                </CardFooter>
            )}
        </Card>
    )

}