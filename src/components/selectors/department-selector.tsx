import { useState } from 'react'
import { ilike, or, useLiveQuery } from '@tanstack/react-db'
import type { ProvisionState } from '../user-modal'
import type { departments } from '@/db/schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { departmentsCollection } from '@/collections/departments'

type Department = typeof departments.$inferSelect

interface DepartmentSelectorProps {
    provisionParams?: ProvisionState
    setProvisionParams?: (params: ProvisionState) => void
}
export function DepartmentSelector({
    provisionParams,
    setProvisionParams,
}: DepartmentSelectorProps) {
    const [query, setQuery] = useState('')

    const selected = provisionParams?.department

    const { data: filteredDepartments, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ departments: departmentsCollection })
                .where(({ departments }) =>
                    or(
                        ilike(departments.code, `%${query}%`),
                        ilike(departments.description, `%${query}%`),
                    ),
                )
                .orderBy(({ departments }) => departments.code, 'asc')
                .limit(query !== '' ? 10 : 0),
        [query], // Re-run when query changes
    )

    if (isLoading) return <Skeleton className="h-10 w-full" />

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
                        setProvisionParams &&
                            setProvisionParams({
                                ...provisionParams,
                                department: null,
                            })
                        setQuery('')
                    }}
                >
                    Remove
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="flex align-center space-x-2">
                <Input
                    placeholder="Search departments..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                />
                {/* {!selected && (
                    <Button
                        variant="destructive"
                        size="default"
                        onClick={() => {
                            setProvisionParams && setProvisionParams({
                                ...provisionParams!,
                                department: null,
                            });
                            setQuery("");
                        }}
                    >
                        Undo
                    </Button>
                )} */}
            </div>
            <DepartmentResults
                filteredDepartments={filteredDepartments}
                onSelect={(dept) => {
                    setProvisionParams &&
                        setProvisionParams({
                            ...provisionParams!,
                            department: dept,
                        })
                    setQuery('')
                }}
            />
        </div>
    )
}

function DepartmentResults({
    filteredDepartments,
    onSelect,
}: {
    filteredDepartments: Array<Department>
    onSelect: (dept: Department) => void
}) {
    if (filteredDepartments.length === 0) return null

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
                ) : null,
            )}
        </ul>
    )
}
