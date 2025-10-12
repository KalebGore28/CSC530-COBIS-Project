import { useState, useEffect, Suspense, useMemo } from "react";
import { useCourseSearch, useCourseResults } from ".";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { debounce } from "lodash-es";
import { courses } from "@/db/schema";

type Course = typeof courses.$inferSelect;

export type ExtendedCourseSearch = Course & {
    taken?: boolean;
    comparison?: string;
    grade?: string;
};

interface CourseSearchBoxProps {
    /** Called whenever the selected course or its state changes */
    onSelectChange?: (selected: ExtendedCourseSearch | null) => void;
}

export function CourseSearchBox({ onSelectChange }: CourseSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Course | null>(null);
    const [taken, setTaken] = useState(false);
    const [comparison, setComparison] = useState("=");
    const [grade, setGrade] = useState("A");

    const { queryRef, loadQuery } = useCourseSearch();

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                if (value.trim().length > 1) loadQuery({ query: value });
            }, 300),
        [loadQuery]
    );

    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);

    // Notify parent whenever selection or filters change
    useEffect(() => {
        if (!selected) return onSelectChange?.(null);
        onSelectChange?.({
            ...selected,
            taken,
            comparison,
            grade,
        });
    }, [selected, taken, comparison, grade]);

    //
    // When a course has been selected
    //
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
                            setQuery("");
                            setTaken(false);
                            setComparison("=");
                            setGrade("");
                        }}
                    >
                        Remove
                    </Button>
                </div>

                <div className="flex items-center justify-between">

                    {/* Taken / Not Taken Toggle */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="taken"
                            checked={taken}
                            onCheckedChange={(checked) => setTaken(Boolean(checked))}
                        />
                        <label htmlFor="taken" className="text-sm">
                            Course Taken
                        </label>
                    </div>

                    {/* Show additional fields only if taken */}
                    {taken && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Comparison selector */}
                            <div className="flex-1">
                                <Select value={comparison} onValueChange={setComparison}>
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
                                <Select value={grade} onValueChange={setGrade}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A</SelectItem>
                                        <SelectItem value="B">B</SelectItem>
                                        <SelectItem value="C">C</SelectItem>
                                        <SelectItem value="D">D</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    //
    // Default search box state
    //
    return (
        <div className="space-y-2">
            <Input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Suspense fallback={<p className="text-sm text-gray-500">Loading results...</p>}>
                {query.trim().length > 1 && queryRef && (
                    <CourseResults
                        queryRef={queryRef}
                        onSelect={(course) => {
                            setSelected({
                                subject: course.subject,
                                number: course.number,
                                suffix: course.suffix,
                                title: course.title,
                                hours: course.hours,
                                last_updated: course.last_updated ? new Date(course.last_updated) : new Date(),
                                department_code: course.department_code ?? null,
                                college_code: course.college_code ?? null,
                            });
                            setQuery("");
                        }}
                    />
                )}
            </Suspense>
        </div>
    );
}

function CourseResults({
    queryRef,
    onSelect,
}: {
    queryRef: any;
    onSelect: (course: Course) => void;
}) {
    const data = useCourseResults(queryRef);
    const results = data?.searchCourses ?? [];

    if (results.length === 0) {
        return <p className="text-sm text-gray-500">No results found.</p>;
    }

    return (
        <ul className="border rounded-md divide-y">
            {results.map(
                (course) =>
                    course && (
                        <li
                            key={`${course.subject}-${course.number}${course.suffix ? `-${course.suffix}` : ""}`}
                            className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => onSelect({
                                subject: course.subject,
                                number: course.number,
                                suffix: course.suffix,
                                title: course.title,
                                hours: course.hours,
                                last_updated: course.last_updated ? new Date(course.last_updated) : new Date(),
                                department_code: course.department_code ?? null,
                                college_code: course.college_code ?? null,
                            })}
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
