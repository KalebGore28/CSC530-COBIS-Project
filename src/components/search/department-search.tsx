import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { departments } from "@/db/schema";
import fuzzysort from "fuzzysort";

type Department = typeof departments.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

export const GetDepartmentsQuery = graphql(`
    query getDepartmentsQuery {
        departments {
            code
            description
            college_code
        }
    }
`)

export function findDepartmentMatchFuzzy(input: string, departments: Department[]): Department[] {
    const results = fuzzysort.go(input, departments, {
        keys: ["description", (d) => d.code],
        threshold: -1000,
        limit: 10,
    });
    return results.map(result => result.obj);
}


interface DepartmentSearchBoxProps {
    /** Called whenever the selected department changes */
    onSelectChange?: (selected: Department | null) => void;
}
export function DepartmentSearchBox({ onSelectChange }: DepartmentSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [selected, setSelected] = useState<Department | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['getDepartments'],
        queryFn: () => execute(GetDepartmentsQuery),
    });

    if (isLoading) return <Skeleton className="h-10 w-full" />;

    const departments: Department[] = (data?.departments ?? []).map(dept => ({
        code: dept.code,
        description: dept.description,
        college_code: dept.college_code ?? null,
    }));

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
                        setFilteredDepartments([]);
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
                placeholder="Search departments..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    const results = findDepartmentMatchFuzzy(e.target.value, departments);
                    setFilteredDepartments(results);
                }}
            />
            <DepartmentResults
                filteredDepartments={filteredDepartments}
                onSelect={(dept) => {
                    setSelected(dept);
                    onSelectChange && onSelectChange(dept);
                    setFilteredDepartments([]);
                    setQuery("");
                }}
            />
        </div>
    );
}

function DepartmentResults({
    filteredDepartments,
    onSelect,
}: {
    filteredDepartments: Department[];
    onSelect: (dept: Department) => void;
}) {
    if (filteredDepartments.length === 0) return null;

    return (
        <ul className="border rounded-md divide-y">
            {filteredDepartments.map((dept) =>
                dept ? (
                    <li
                        key={dept.code}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() =>
                            onSelect({
                                code: dept.code,
                                description: dept.description,
                                college_code: null,
                            })
                        }
                    >
                        <strong>{dept.code}</strong> — {dept.description}
                    </li>
                ) : null
            )}
        </ul>
    );
}
