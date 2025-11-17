import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { faculty } from "@/db/schema";

type Faculty = typeof faculty.$inferSelect;

import { facultyCollection } from "@/collections/faculty";
import { useLiveQuery, ilike, or } from "@tanstack/react-db";

interface FacultySelectorProps {
    /** Optional M number to preselect a faculty member */
    mnumber: string | null;
    /** Called whenever the selected faculty changes */
    onSelectChange?: (selected: Faculty | null) => void;
}
export function FacultySelector({ mnumber, onSelectChange }: FacultySelectorProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Faculty | null>(null);

    const { data: faculty } = useLiveQuery((q) =>
        q.from({ faculty: facultyCollection })
            .orderBy(({ faculty }) => faculty.mnumber, 'asc'),
        [] // Run only once
    );

    const { data: filteredFaculty, isLoading, isReady } = useLiveQuery((q) =>
        q.from({ faculty: facultyCollection })
            .where(({ faculty }) =>
                or(
                    ilike(faculty.mnumber, `%${query}%`),
                    ilike(faculty.first_name, `%${query}%`),
                    ilike(faculty.last_name, `%${query}%`)
                )
            )
            .orderBy(({ faculty }) => faculty.mnumber, 'asc')
            .limit(query !== "" ? 10 : 0),
        [query] // Re-run when query changes
    );

    // Runs only once to set default selection if mnumber prop is provided
    useEffect(() => {
        if (!isReady || isLoading) return;
        const defaultFaculty = faculty.find((f) => f.mnumber === mnumber);
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
                    }}
                />
                {mnumber && !selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setSelected(faculty.find((f) => f.mnumber === mnumber) || null);
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