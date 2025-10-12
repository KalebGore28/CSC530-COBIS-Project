import { useState, useEffect, Suspense, useMemo } from "react";
import { useProgramSearch, useProgramResults } from ".";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { debounce } from "lodash-es";
import { programs } from "@/db/schema";

type Program = typeof programs.$inferSelect;

export type ExtendedProgramSearch = Program & {
    selectedAs?: "major" | "minor" | null;
};

interface ProgramSearchBoxProps {
    onSelectChange?: (
        selected: ExtendedProgramSearch | null
    ) => void;
}

export function ProgramSearchBox({ onSelectChange }: ProgramSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Program | null>(null);
    const { queryRef, loadQuery } = useProgramSearch();
    const [isMajor, setIsMajor] = useState(true);
    const [isMinor, setIsMinor] = useState(false);

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
        if (onSelectChange) {
            if (selected) {
                onSelectChange({
                    ...selected,
                    selectedAs: isMajor ? "major" : isMinor ? "minor" : null,
                });
            } else {
                onSelectChange(null);
            }
        }
    }, [selected, isMajor, isMinor]);

    if (selected) {
        return (
            <div className="flex flex-col gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
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

                {/* Conditional Major / Minor checkboxes */}
                <div className="flex gap-6 pl-1 items-center">
                    {selected.is_major && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="major"
                                checked={isMajor}
                                onCheckedChange={(checked) => {
                                    // Only allow one checked at a time
                                    setIsMajor(!!checked);
                                    setIsMinor(!checked);
                                }}
                            />
                            <Label htmlFor="major" className="text-sm">
                                Major
                            </Label>
                        </div>
                    )}

                    {selected.is_minor && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="minor"
                                checked={isMinor}
                                onCheckedChange={(checked) => {
                                    setIsMinor(!!checked);
                                    setIsMajor(!checked);
                                }}
                            />
                            <Label htmlFor="minor" className="text-sm">
                                Minor
                            </Label>
                        </div>
                    )}
                </div>
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
                        <div className="flex flex-wrap items-center justify-start space-x-2 w-full gap-2">

                            <strong>{prog.code}</strong> — {prog.description}
                            <div className="space-x-2">
                                {prog.is_major && (
                                    <Badge
                                        variant="outline"
                                        className="text-green-800 border-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900"
                                    >
                                        Major
                                    </Badge>
                                )}
                                {prog.is_minor && (
                                    <Badge
                                        variant="outline"
                                        className="text-blue-800 border-blue-800 bg-blue-100 dark:text-blue-100 dark:bg-blue-900"
                                    >
                                        Minor
                                    </Badge>
                                )}
                                {prog.has_concentration && (
                                    <Badge
                                        variant="outline"
                                        className="text-purple-800 border-purple-800 bg-purple-100 dark:text-purple-100 dark:bg-purple-900"
                                    >
                                        Concentration
                                    </Badge>
                                )}
                                {prog.is_discontinued && (
                                    <Badge
                                        variant="outline"
                                        className="text-red-800 border-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900"
                                    >
                                        Discontinued
                                    </Badge>
                                )}
                                {prog.is_aacsb && (
                                    <Badge
                                        variant="outline"
                                        className="text-amber-800 border-amber-800 bg-amber-100 dark:text-amber-100 dark:bg-amber-900"
                                    >
                                        AACSB
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </li>
                ) : null
            )}
        </ul>
    );
}