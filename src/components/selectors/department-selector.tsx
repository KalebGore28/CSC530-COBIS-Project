import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { departments } from "@/db/schema";

type Department = typeof departments.$inferSelect;

import { departmentsCollection } from "@/collections/departments";
import { useLiveQuery, ilike, or } from "@tanstack/react-db";


interface DepartmentSelectorProps {
    /** Optional department code to preselect a department */
    departmentCode?: string;
    /** Called whenever the selected department changes */
    onSelectChange?: (selected: Department | null) => void;
}
export function DepartmentSelector({ departmentCode, onSelectChange }: DepartmentSelectorProps) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Department | null>(null);

    const { data: departments } = useLiveQuery((q) =>
        q.from({ departments: departmentsCollection })
            .orderBy(({ departments }) => departments.code, 'asc'),
        [] // Run only once
    );

    const { data: filteredDepartments, isLoading } = useLiveQuery((q) =>
        q.from({ departments: departmentsCollection })
            .where(({ departments }) =>
                or(
                    ilike(departments.code, `%${query}%`),
                    ilike(departments.description, `%${query}%`)
                )
            )
            .orderBy(({ departments }) => departments.code, 'asc')
            .limit(query !== "" ? 10 : 0),
        [query] // Re-run when query changes
    );

    // Runs only once to set default selection if departmentCode prop is provided
    useEffect(() => {
        if (!departmentCode || !departments.length || isLoading) return;
        const defaultDepartment = departments.find((d) => d.code === departmentCode);
        if (defaultDepartment && (!selected || selected.code !== defaultDepartment.code)) {
            setSelected(defaultDepartment);
            onSelectChange?.(defaultDepartment);
        }
    }, [departmentCode, isLoading]);

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
                    placeholder="Search departments..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                />
                {departmentCode && !selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setSelected(departments.find((d) => d.code === departmentCode) || null);
                            setQuery("");
                        }}
                    >
                        Undo
                    </Button>
                )}
            </div>
            <DepartmentResults
                filteredDepartments={filteredDepartments}
                onSelect={(dept) => {
                    setSelected(dept);
                    onSelectChange && onSelectChange(dept);
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
