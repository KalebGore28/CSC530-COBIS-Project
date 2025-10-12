import { useState, useEffect, Suspense, useMemo } from "react";
import { useDepartmentSearch, useDepartmentResults } from "."
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash-es";
import { departments } from "@/db/schema";

type Department = typeof departments.$inferSelect;

interface DepartmentSearchBoxProps {
    /** Called whenever the selected department changes */
    onSelectChange?: (selected: Department | null) => void;
}
export function DepartmentSearchBox({ onSelectChange }: DepartmentSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Department | null>(null);
    const { queryRef, loadQuery } = useDepartmentSearch();

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

    // If a department is selected, stop showing search results
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
            <Input
                placeholder="Search departments..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Suspense fallback={<p className="text-sm text-gray-500">Loading results...</p>}>
                {query.trim().length > 1 && queryRef && (
                    <Suspense fallback={<p className="text-sm text-gray-500">Loading results...</p>}>
                        <DepartmentResults
                            queryRef={queryRef}
                            onSelect={(dept) => {
                                setSelected({
                                    code: dept.code,
                                    description: dept.description,
                                    college_code: dept.college_code ?? null,
                                });
                                setQuery("");
                            }}
                        />
                    </Suspense>
                )}
            </Suspense>
        </div>
    );
}

function DepartmentResults({
    queryRef,
    onSelect,
}: {
    queryRef: any;
    onSelect: (dept: Department) => void;
}) {
    const data = useDepartmentResults(queryRef);
    const results = data?.searchDepartments ?? [];

    if (results.length === 0) {
        return <p className="text-sm text-gray-500">No results found.</p>;
    }

    return (
        <ul className="border rounded-md divide-y">
            {results.map((dept) =>
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
