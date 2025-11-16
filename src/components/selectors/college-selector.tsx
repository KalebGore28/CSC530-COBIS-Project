import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { colleges } from "@/db/schema";

type College = typeof colleges.$inferSelect;

import { collegesCollection } from "@/collections/colleges";
import { useLiveQuery, ilike, or } from "@tanstack/react-db";

interface CollegeSelectorProps {
    collegeCode?: string;
    /** Called whenever the selected college changes */
    onSelectChange?: (selected: College | null) => void;
}
export function CollegeSelector({ collegeCode, onSelectChange }: CollegeSelectorProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<College | null>(null);

    const { data: colleges } = useLiveQuery((q) =>
        q.from({ colleges: collegesCollection })
            .orderBy(({ colleges }) => colleges.code, 'asc'),
        [] // Run only once
    );

    const { data: filteredColleges, isLoading, isReady } = useLiveQuery((q) =>
        q.from({ colleges: collegesCollection })
            .where(({ colleges }) =>
                or(
                    ilike(colleges.code, `%${query}%`),
                    ilike(colleges.description, `%${query}%`)
                )
            )
            .orderBy(({ colleges }) => colleges.code, 'asc')
            .limit(query !== "" ? 10 : 0),
        [query] // Re-run when query changes
    );

    // Runs only once to set default selection if collegeCode prop is provided
    useEffect(() => {
        if (!isReady || isLoading) return;
        const defaultCollege = colleges.find((c) => c.code === collegeCode);
        if (defaultCollege && (!selected || selected.code !== defaultCollege.code)) {
            setSelected(defaultCollege);
            onSelectChange?.(defaultCollege);
        }
    }, [collegeCode, isLoading]);

    if (isLoading) return <Skeleton className="h-10 w-full" />;

    if (selected) {
        return (
            <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div>
                    <strong>{selected.code}</strong> — {selected.description}
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
                    placeholder="Search colleges..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                />
                {collegeCode && !selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setSelected(colleges.find((c) => c.code === collegeCode) || null);
                            setQuery("");
                        }}
                    >
                        Undo
                    </Button>
                )}
            </div>
            <CollegeResults
                filteredColleges={filteredColleges}
                onSelect={(college) => {
                    setSelected(college);
                    onSelectChange && onSelectChange(college);
                    setQuery("");
                }}
            />
        </div>
    );
}

function CollegeResults({
    filteredColleges,
    onSelect,
}: {
    filteredColleges: College[];
    onSelect: (college: College) => void;
}) {
    if (filteredColleges.length === 0) return null;

    return (
        <ul className="border rounded-md divide-y">
            {filteredColleges.map((college) =>
                college ? (
                    <li
                        key={college.code}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() =>
                            onSelect({
                                code: college.code,
                                description: college.description,
                            })
                        }
                    >
                        <strong>{college.code}</strong> — {college.description}
                    </li>
                ) : null
            )}
        </ul>
    );
}