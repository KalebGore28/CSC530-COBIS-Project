import { useState, useEffect, Suspense, useMemo } from "react";
import { useCourseSearch, useCourseResults } from ".";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash-es";
import { courses } from "@/db/schema";

type Course = typeof courses.$inferSelect;

interface CourseSearchBoxProps {
    /** Called whenever the selected course changes */
    onSelectChange?: (selected: Course | null) => void;
}

export function CourseSearchBox({ onSelectChange }: CourseSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Course | null>(null);
    const { queryRef, loadQuery } = useCourseSearch();

    // Debounce GraphQL search
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

    // Notify parent whenever selection changes
    useEffect(() => {
        return onSelectChange?.(selected);
    }, [selected, onSelectChange]);

    if (selected) {
        return (
            <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div>
                    <strong>{selected.subject} {selected.number}{selected.suffix ? `-${selected.suffix}` : ""}</strong> — {selected.title}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelected(null);
                        setQuery("");
                    }}
                >
                    Remove
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search programs..."
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
            {results.map((course) =>
                course ? (
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
                        <strong>{course.subject} {course.number}{course.suffix ? `-${course.suffix}` : ""}</strong> — {course.title}
                    </li>
                ) : null
            )}
        </ul>
    );
}