import { useState, useEffect, Suspense, useMemo } from "react";
import { useProgramSearch, useProgramResults } from ".";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash-es";
import { programs } from "@/db/schema";

type Program = typeof programs.$inferSelect;

interface ProgramSearchBoxProps {
    /** Called whenever the selected program changes */
    onSelectChange?: (selected: Program | null) => void;
}

export function ProgramSearchBox({ onSelectChange }: ProgramSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Program | null>(null);
    const { queryRef, loadQuery } = useProgramSearch();

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
                placeholder="Search programs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Suspense fallback={<p className="text-sm text-gray-500">Loading results...</p>}>
                {query.trim().length > 1 && queryRef && (
                    <ProgramResults
                        queryRef={queryRef}
                        onSelect={(prog) => {
                            setSelected({
                                code: prog.code,
                                description: prog.description,
                                cip_code: prog.cip_code,
                                is_major: prog.is_major,
                                is_minor: prog.is_minor,
                                has_concentration: prog.has_concentration,
                                is_discontinued: prog.is_discontinued,
                                is_aacsb: prog.is_aacsb,
                                department_code: prog.department_code,
                                college_code: prog.college_code ?? null,
                                last_updated: prog.last_updated,
                            });
                            setQuery("");
                        }}
                    />
                )}
            </Suspense>
        </div>
    );
}

function ProgramResults({
    queryRef,
    onSelect,
}: {
    queryRef: any;
    onSelect: (prog: Program) => void;
}) {
    const data = useProgramResults(queryRef);
    const results = data?.searchPrograms ?? [];

    if (results.length === 0) {
        return <p className="text-sm text-gray-500">No results found.</p>;
    }

    return (
        <ul className="border rounded-md divide-y">
            {results.map((prog) =>
                prog ? (
                    <li
                        key={prog.code}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() =>
                            onSelect({
                                code: prog.code,
                                description: prog.description,
                                cip_code: prog.cip_code ?? null,
                                is_major: prog.is_major,
                                is_minor: prog.is_minor,
                                has_concentration: prog.has_concentration,
                                is_discontinued: prog.is_discontinued,
                                is_aacsb: prog.is_aacsb,
                                department_code: prog.department_code ?? null,
                                college_code: prog.college_code ?? null,
                                last_updated: prog.last_updated ? new Date(prog.last_updated) : new Date(),
                            })
                        }
                    >
                        <strong>{prog.code}</strong> — {prog.description}
                    </li>
                ) : null
            )}
        </ul>
    );
}