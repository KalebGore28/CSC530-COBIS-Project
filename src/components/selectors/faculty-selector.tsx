import { useEffect, useState } from 'react'
import { eq, ilike, or, useLiveQuery } from '@tanstack/react-db'
import type { faculty, user } from '@/db/schema'
import type { ProvisionState } from '../user-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { facultyCollection } from '@/integrations/tanstack-db/faculty'

type Faculty = typeof faculty.$inferSelect

type User = typeof user.$inferSelect

interface FacultySelectorProps {
    user: User | null
    provisionParams?: ProvisionState
    setProvisionParams?: (params: ProvisionState) => void
}
export function FacultySelector({
    user,
    provisionParams,
    setProvisionParams,
}: FacultySelectorProps) {
    const [query, setQuery] = useState('')

    const { data: departments } = useLiveQuery(
        (q) =>
            q
                .from({ departments: departmentsCollection })
                .orderBy(({ departments }) => departments.code, 'asc'),
        [], // Run only once
    )

    const { data: colleges } = useLiveQuery(
        (q) =>
            q
                .from({ colleges: collegesCollection })
                .orderBy(({ colleges }) => colleges.code, 'asc'),
        [], // Run only once
    )

    const selected = provisionParams?.faculty

    const { data: facultyByUser } = useLiveQuery((q) =>
        q
            .from({ faculty: facultyCollection })
            .where(({ faculty }) => eq(faculty.mnumber, user?.mnumber || ''))
            .findOne(),
    )

    const { data: filteredFaculty, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ faculty: facultyCollection })
                .where(({ faculty }) =>
                    or(
                        ilike(faculty.mnumber, `%${query}%`),
                        ilike(faculty.first_name, `%${query}%`),
                        ilike(faculty.last_name, `%${query}%`),
                    ),
                )
                .orderBy(({ faculty }) => faculty.mnumber, 'asc')
                .limit(query !== '' ? 10 : 0),
        [query], // Re-run when query changes
    )

    useEffect(() => {
        // If there's faculty associated with the user and no faculty is selected yet, set it
        if (facultyByUser && !provisionParams?.faculty) {
            setProvisionParams &&
                setProvisionParams({
                    ...provisionParams!,
                    isEnabled: user?.isEnabled || false,
                    faculty: facultyByUser,
                    department:
                        departments.find(
                            (d) => d.code === facultyByUser.department_code,
                        ) || null,
                    college:
                        colleges.find(
                            (c) => c.code === facultyByUser.college_code,
                        ) || null,
                })
        }
    }, []) // Run only once on mount

    if (isLoading) return <Skeleton className="h-10 w-full" />

    if (selected) {
        return (
            <div className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 bg-muted/30">
                <div>
                    <strong>{selected.mnumber}</strong> — {selected.first_name}{' '}
                    {selected.last_name}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setProvisionParams &&
                            setProvisionParams({
                                ...provisionParams,
                                faculty: null,
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
                    placeholder="Search faculty..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                />
            </div>
            <FacultyResults
                filteredFaculty={filteredFaculty}
                onSelect={(faculty) => {
                    setProvisionParams &&
                        setProvisionParams({
                            ...provisionParams!,
                            isEnabled: user?.isEnabled || false,
                            faculty: faculty,
                            department:
                                departments.find(
                                    (d) => d.code === faculty.department_code,
                                ) || null,
                            college:
                                colleges.find(
                                    (c) => c.code === faculty.college_code,
                                ) || null,
                        })
                    setQuery('')
                }}
            />
        </div>
    )
}

function FacultyResults({
    filteredFaculty,
    onSelect,
}: {
    filteredFaculty: Array<Faculty>
    onSelect: (faculty: Faculty) => void
}) {
    if (filteredFaculty.length === 0) return null

    return (
        <ul className="border rounded-md divide-y">
            {filteredFaculty.map((faculty) =>
                faculty ? (
                    <li
                        key={faculty.mnumber}
                        className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => onSelect(faculty)}
                    >
                        <strong>{faculty.mnumber}</strong> —{' '}
                        {faculty.first_name} {faculty.last_name}
                    </li>
                ) : null,
            )}
        </ul>
    )
}
