import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { courses } from "@/db/schema";
import fuzzysort from "fuzzysort";

type Course = typeof courses.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


export const GetCoursesQuery = graphql(`
  query getCoursesQuery {
    courses {
        subject
        number
        suffix
        title
        hours
        last_updated
        department_code
        college_code
    }
  }
`);

export function findCourseMatchFuzzy(input: string, courses: Course[]): Course[] {
    const results = fuzzysort.go(input, courses, {
        keys: ["title", (c) => `${c.subject}${c.number}${c.suffix ?? ""}`],
        threshold: -1000,
        limit: 10,
    });
    return results.map(result => result.obj);
}

export type ExtendedCourseSearch = Course & {
    taken?: boolean;
    operator?: string;
    grade?: string;
};

interface CourseSearchBoxProps {
    /** Called whenever the selected course or its state changes */
    onSelectChange?: (selected: ExtendedCourseSearch | null) => void;
}

export function CourseSearchBox({ onSelectChange }: CourseSearchBoxProps) {
    const operatorKey = {
        "=": "EQ",
        ">=": "GTE",
        "<=": "LTE",
    }
    type Operator = "=" | ">=" | "<=";
    const [query, setQuery] = useState("");
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [selected, setSelected] = useState<Course | null>(null);
    const [taken, setTaken] = useState(false);
    const [operator, setOperator] = useState<Operator>("=");
    const [grade, setGrade] = useState("A");

    const { data, isLoading } = useQuery({
        queryKey: ['getCourses'],
        queryFn: () => execute(GetCoursesQuery),
    });

    if (isLoading) return <Skeleton className="h-10 w-full" />;

    const courses: Course[] = (data?.courses ?? []).map((course) => ({
        subject: course.subject,
        number: course.number,
        suffix: course.suffix,
        title: course.title,
        hours: course.hours,
        last_updated: course.last_updated ? new Date(course.last_updated) : new Date(),
        department_code: course.department_code ?? null,
        college_code: course.college_code ?? null,
    }));

    if (selected) {
        return (
            <div className="flex flex-col gap-3 border rounded-md p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                    <div>
                        <strong>
                            {selected.subject}
                            {selected.number}
                            {selected.suffix ? `-${selected.suffix}` : ""}
                        </strong>{" "}
                        — {selected.title}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelected(null);
                            setFilteredCourses([]);
                            setQuery("");
                            setTaken(false);
                            setOperator("=");
                            setGrade("");
                            onSelectChange && onSelectChange(null);
                        }}
                    >
                        Remove
                    </Button>
                </div>

                <div className="flex items-center justify-between">

                    {/* Taken / Not Taken Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Taken:</span>
                        <Tabs
                            value={taken ? "yes" : "no"}
                            onValueChange={(val) => {
                                setTaken(val === "yes")
                                onSelectChange && onSelectChange({
                                    ...selected,
                                    taken: val === "yes",
                                    operator: operatorKey[operator],
                                    grade
                                });
                            }}
                            className="bg-background border rounded-md"
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="yes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    Yes
                                </TabsTrigger>
                                <TabsTrigger value="no" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    No
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Show additional fields only if taken */}
                    {taken && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Comparison selector */}
                            <div className="flex-1">
                                <Select value={operator} onValueChange={(val) => {
                                    setOperator(val as Operator)
                                    onSelectChange && onSelectChange({
                                        ...selected,
                                        taken,
                                        operator: operatorKey[val as Operator],
                                        grade
                                    });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select comparison" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="=">=</SelectItem>
                                        <SelectItem value=">=">&gt;=</SelectItem>
                                        <SelectItem value="<=">&lt;=</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Grade selector */}
                            <div className="flex-1">
                                <Select value={grade} onValueChange={(val) => {
                                    setGrade(val);
                                    onSelectChange && onSelectChange({
                                        ...selected,
                                        taken,
                                        operator: operatorKey[operator],
                                        grade: val
                                    });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="E">E</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    const results = findCourseMatchFuzzy(e.target.value, courses);
                    setFilteredCourses(results);
                }}
            />
            <CourseResults
                filteredCourses={filteredCourses}
                onSelect={(course) => {
                    setSelected(course);
                    onSelectChange && onSelectChange({
                        ...course,
                        taken,
                        operator: operatorKey[operator],
                        grade
                    });
                    setFilteredCourses([]);
                    setQuery("");
                }}
            />
        </div>
    );
}

function CourseResults({
    filteredCourses,
    onSelect,
}: {
    filteredCourses: Course[];
    onSelect: (course: Course) => void;
}) {
    if (filteredCourses.length === 0) return null;

    return (
        <ul className="border rounded-md divide-y">
            {filteredCourses.map(
                (course) =>
                    course && (
                        <li
                            key={`${course.subject}-${course.number}${course.suffix ? `-${course.suffix}` : ""}`}
                            className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => {
                                onSelect(course);
                            }}
                        >
                            <strong>
                                {course.subject} {course.number}
                                {course.suffix ? `-${course.suffix}` : ""}
                            </strong>{" "}
                            — {course.title}
                        </li>
                    )
            )}
        </ul>
    );
}
