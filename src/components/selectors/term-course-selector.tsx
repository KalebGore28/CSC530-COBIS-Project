import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

import type { StudentCourse } from "@/routes/_authenticated/_layout/class-roster";

export type SelectedTerm = {
    year: number;
    term_code: string;
    term_description?: string;
    studentCount: number;
    creditHoursDelivered: number;
}

export type SelectedCourse = {
    course_id: string;
    course_section: string;
    course_hours: number;
    course_title?: string;
    year: number;
    term_code: string;
    term_description?: string;
    student_count: number;
    credit_hours_delivered: number;
}

type TermCourseSelectorProps = {
    studentCourses: StudentCourse[];
    isLoading?: boolean;
    showStats?: boolean;
    className?: string;
    selectedTerm?: SelectedTerm;
    selectedCourse?: SelectedCourse;
    setSelectedTerm: (term: SelectedTerm) => void;
    setSelectedCourse: (course: SelectedCourse) => void;
}

export function TermCourseSelector({
    studentCourses,
    isLoading,
    showStats,
    className,
    selectedTerm,
    selectedCourse,
    setSelectedTerm,
    setSelectedCourse
}: TermCourseSelectorProps) {

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Term & Course Selector</CardTitle>
                <CardDescription>Select a term and course to view the class roster.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Term Selector Component */}
                <TermSelector
                    studentCourses={studentCourses}
                    isLoading={isLoading}
                    showStats={showStats}
                    setSelectedTerm={setSelectedTerm}
                    selectedTerm={selectedTerm || undefined}
                />
                {/* Course Selector Component */}
                {selectedTerm && (
                    <CourseSelector
                        studentCourses={studentCourses}
                        isLoading={isLoading}
                        showStats={showStats}
                        selectedTerm={selectedTerm}
                        selectedCourse={selectedCourse}
                        setSelectedCourse={setSelectedCourse}
                    />
                )}
            </CardContent>
        </Card>
    );
}

type TermSelectorProps = {
    studentCourses: StudentCourse[];
    isLoading?: boolean;
    showStats?: boolean;
    selectedTerm?: SelectedTerm;
    setSelectedTerm?: (term: SelectedTerm) => void;
}

function TermSelector({
    studentCourses,
    isLoading,
    showStats,
    selectedTerm,
    setSelectedTerm
}: TermSelectorProps) {

    // Loading state
    if (isLoading) {
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

    // Extract unique terms from studentCourses
    const terms = new Map<string, SelectedTerm>();

    for (const c of studentCourses) {
        const key = `${c.year}-${c.term_code}`;

        let term = terms.get(key);
        if (!term) {
            term = {
                year: c.year,
                term_code: c.term_code,
                term_description: c.term_description,
                studentCount: 0,
                creditHoursDelivered: 0,
            };

            terms.set(key, term);
        }

        // Update aggregates
        term.studentCount += 1;
        term.creditHoursDelivered += c.course_hours;
    }

    // Run once to select the first term if none is selected
    useEffect(() => {
        if (!selectedTerm && terms.size > 0) {
            const firstTerm = terms.values().next().value;
            setSelectedTerm && setSelectedTerm(firstTerm!);
        }
    }, [terms]);
    return (
        <Card>
            <CardContent>
                <Select
                    value={selectedTerm ? `${selectedTerm.year}-${selectedTerm.term_code}` : "Select Term"}
                    onValueChange={(value) => {
                        const term = terms.get(value);
                        setSelectedTerm && term && setSelectedTerm(term);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from(terms.values()).map((term, index) => (
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
                        {selectedTerm.creditHoursDelivered} Total Credit Hours
                    </Badge>
                </CardFooter>
            )}
        </Card>
    )
}

type CourseSelectorProps = {
    studentCourses: StudentCourse[];
    isLoading?: boolean;
    showStats?: boolean;
    selectedTerm: SelectedTerm;
    selectedCourse?: SelectedCourse;
    setSelectedCourse?: (course: SelectedCourse) => void;
}

function CourseSelector({
    studentCourses,
    isLoading,
    showStats,
    selectedTerm,
    selectedCourse,
    setSelectedCourse
}: CourseSelectorProps) {

    // Loading state
    if (isLoading) {
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

    // Filter studentCourses for the selected term
    const filteredCourses = studentCourses.filter(c =>
        c.year === selectedTerm.year && c.term_code === selectedTerm.term_code
    );

    // Extract courses for the selected term
    const termCourses = new Map<string, SelectedCourse>();

    for (const c of filteredCourses) {
        const key = `${c.course_id}-${c.course_section}`;

        const course = termCourses.get(key);
        if (!course) {
            termCourses.set(key, {
                course_id: c.course_id,
                course_section: c.course_section,
                course_title: c.course_title,
                course_hours: c.course_hours,
                year: c.year,
                term_code: c.term_code,
                term_description: c.term_description,
                student_count: 0,
                credit_hours_delivered: 0,
            });
        }

        // Update aggregates
        const updatedCourse = termCourses.get(key);
        if (updatedCourse) {
            updatedCourse.student_count += 1;
            updatedCourse.credit_hours_delivered += c.course_hours;
            termCourses.set(key, updatedCourse);
        }
    }

    // Run once to select the first course if none is selected
    useEffect(() => {
        if (!selectedCourse && termCourses.size > 0) {
            const firstTerm = termCourses.values().next().value;
            setSelectedCourse && setSelectedCourse(firstTerm!);
        }
    }, [termCourses]);

    return (
        <Card>
            <CardContent>
                <Select
                    value={selectedCourse ? `${selectedCourse.course_id}-${selectedCourse.course_section}` : "Select Course"}
                    onValueChange={(value) => {
                        const course = termCourses.get(value);
                        setSelectedCourse && course && setSelectedCourse(course);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from(termCourses.values()).map((course, index) => (
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
                        {selectedCourse.credit_hours_delivered} Total Credit Hours
                    </Badge>
                </CardFooter>
            )}
        </Card>
    )

}