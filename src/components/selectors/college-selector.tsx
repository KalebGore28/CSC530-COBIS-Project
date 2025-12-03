import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { colleges } from "@/db/schema";

type College = typeof colleges.$inferSelect;

import { collegesCollection } from "@/collections/colleges";
import { useLiveQuery, ilike, or } from "@tanstack/react-db";

import type { ProvisionState } from "../user-modal";

interface CollegeSelectorProps {
    provisionParams?: ProvisionState;
    setProvisionParams?: (params: ProvisionState) => void;
}
export function CollegeSelector({ provisionParams, setProvisionParams }: CollegeSelectorProps) {
    const [query, setQuery] = useState("");

    const selected = provisionParams?.college

    const { data: filteredColleges, isLoading } = useLiveQuery((q) =>
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
                        setProvisionParams && setProvisionParams({
                            ...provisionParams!,
                            college: null,
                        });
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
            </div>
            <CollegeResults
                filteredColleges={filteredColleges}
                onSelect={(college) => {
                    setProvisionParams && setProvisionParams({
                        ...provisionParams!,
                        college: college,
                    });
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