import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { faculty } from "@/db/schema";
import fuzzysort from "fuzzysort";

type Faculty = typeof faculty.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

export const GetFacultyQuery = graphql(`
    query getFacultyQuery {
        faculty {
            mnumber
            first_name
            last_name
            department_code
            college_code
        }
    }
`)

export function findFacultyMatchFuzzy(input: string, facultyList: Faculty[]): Faculty[] {
    const results = fuzzysort.go(input, facultyList, {
        keys: ["first_name", "last_name", (f) => f.mnumber],
        threshold: -1000,
        limit: 10,
    });
    return results.map(result => result.obj);
}

interface FacultySearchBoxProps {
    /** Optional M number to preselect a faculty member */
    mnumber?: string;
    /** Called whenever the selected faculty changes */
    onSelectChange?: (selected: Faculty | null) => void;
}
export function FacultySearchBox({ mnumber, onSelectChange }: FacultySearchBoxProps) {
    const [query, setQuery] = useState("");
    const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
    const [selected, setSelected] = useState<Faculty | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['getFaculty'],
        queryFn: () => execute(GetFacultyQuery),
    });

    const facultyList: Faculty[] = (data?.faculty ?? []).map(faculty => ({
        mnumber: faculty.mnumber,
        first_name: faculty.first_name,
        last_name: faculty.last_name,
        department_code: faculty.department_code ?? null,
        college_code: faculty.college_code ?? null,
    }));

    // Runs only once to set default selection if mnumber prop is provided
    useEffect(() => {
        if (!mnumber || !facultyList.length || isLoading) return;
        const defaultFaculty = facultyList.find((f) => f.mnumber === mnumber);
        if (defaultFaculty && (!selected || selected.mnumber !== defaultFaculty.mnumber)) {
            setSelected(defaultFaculty);
            onSelectChange?.(defaultFaculty);
        }
    }, [mnumber, isLoading]);

    if (isLoading) return <Skeleton className="h-10 w-full" />;

    if (selected) {
        return (
            <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div>
                    <strong>{selected.mnumber}</strong> — {selected.first_name} {selected.last_name}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelected(null);
                        setFilteredFaculty([]);
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
            <div className="flex align-center space-x-2">
                <Input
                    placeholder="Search faculty..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        const results = findFacultyMatchFuzzy(e.target.value, facultyList);
                        setFilteredFaculty(results);
                    }}
                />
                {mnumber && !selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setSelected(facultyList.find((f) => f.mnumber === mnumber) || null);
                            setFilteredFaculty([]);
                            setQuery("");
                        }}
                    >
                        Undo
                    </Button>
                )}
            </div>
            <FacultyResults
                filteredFaculty={filteredFaculty}
                onSelect={(faculty) => {
                    setSelected(faculty);
                    onSelectChange && onSelectChange(faculty);
                    setFilteredFaculty([]);
                    setQuery("");
                }}
            />
        </div>
    );
}

function FacultyResults({
    filteredFaculty,
    onSelect,
}: {
    filteredFaculty: Faculty[];
    onSelect: (faculty: Faculty) => void;
}) {
    if (filteredFaculty.length === 0) return null;

    return (
        <ul className="border rounded-md divide-y">
            {filteredFaculty.map((faculty) =>
                faculty ? (
                    <li
                        key={faculty.mnumber}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() =>
                            onSelect({
                                mnumber: faculty.mnumber,
                                first_name: faculty.first_name,
                                last_name: faculty.last_name,
                                department_code: faculty.department_code,
                                college_code: faculty.college_code,
                            })
                        }
                    >
                        <strong>{faculty.mnumber}</strong> — {faculty.first_name} {faculty.last_name}
                    </li>
                ) : null
            )}
        </ul>
    );
}