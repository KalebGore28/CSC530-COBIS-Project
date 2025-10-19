import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { colleges } from "@/db/schema";
import fuzzysort from "fuzzysort";

type College = typeof colleges.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

export const GetCollegesQuery = graphql(`
    query getCollegesQuery {
        colleges {
            code
            description
        }
    }
`)

export function findCollegeMatchFuzzy(input: string, colleges: College[]): College[] {
    const results = fuzzysort.go(input, colleges, {
        keys: ["description", (c) => c.code],
        threshold: -1000,
        limit: 10,
    });
    return results.map(result => result.obj);
}

interface CollegeSelectorProps {
    collegeCode?: string;
    /** Called whenever the selected college changes */
    onSelectChange?: (selected: College | null) => void;
}
export function CollegeSelector({ collegeCode, onSelectChange }: CollegeSelectorProps) {
    const [query, setQuery] = useState("");
    const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
    const [selected, setSelected] = useState<College | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['getColleges'],
        queryFn: () => execute(GetCollegesQuery),
    });

    const colleges: College[] = (data?.colleges ?? []).map(college => ({
        code: college.code,
        description: college.description,
    }));


    // Runs only once to set default selection if collegeCode prop is provided
    useEffect(() => {
        if (!collegeCode || !colleges.length || isLoading) return;
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
                        setFilteredColleges([]);
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
                        const results = findCollegeMatchFuzzy(e.target.value, colleges);
                        setFilteredColleges(results);
                    }}
                />
                {collegeCode && !selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setSelected(colleges.find((c) => c.code === collegeCode) || null);
                            setFilteredColleges([]);
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
                    setFilteredColleges([]);
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