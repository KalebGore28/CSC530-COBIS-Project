import { useState } from 'react'
import { ilike, or, useLiveQuery } from '@tanstack/react-db'
import type { ProvisionState } from '../user-modal'
import type { colleges } from '@/db/schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { collegesCollection } from '@/integrations/tanstack-db/colleges'

type College = typeof colleges.$inferSelect

interface CollegeSelectorProps {
    provisionParams?: ProvisionState
    setProvisionParams?: (params: ProvisionState) => void
}
export function CollegeSelector({
    provisionParams,
    setProvisionParams,
}: CollegeSelectorProps) {
    const [query, setQuery] = useState('')

    const selected = provisionParams?.college

    const { data: filteredColleges, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ colleges: collegesCollection })
                .where(({ colleges }) =>
                    or(
                        ilike(colleges.id, `%${query}%`),
                        ilike(colleges.description, `%${query}%`),
                    ),
                )
                .orderBy(({ colleges }) => colleges.id, 'asc')
                .limit(query !== '' ? 10 : 0),
        [query], // Re-run when query changes
    )

    if (isLoading) return <Skeleton className="h-10 w-full" />

    if (selected) {
        return (
            <div className="bg-muted/30 flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <div>
                    <strong>{selected.id}</strong> — {selected.description}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setProvisionParams &&
                            setProvisionParams({
                                ...provisionParams,
                                college: null,
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
            <div className="align-center flex space-x-2">
                <Input
                    placeholder="Search colleges..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                />
            </div>
            <CollegeResults
                filteredColleges={filteredColleges}
                onSelect={(college) => {
                    setProvisionParams &&
                        setProvisionParams({
                            ...provisionParams!,
                            college: college,
                        })
                    setQuery('')
                }}
            />
        </div>
    )
}

function CollegeResults({
    filteredColleges,
    onSelect,
}: {
    filteredColleges: Array<College>
    onSelect: (college: College) => void
}) {
    if (filteredColleges.length === 0) return null

    return (
        <ul className="divide-y rounded-md border">
            {filteredColleges.map((college) => (
                <li
                    key={college.id}
                    className="hover:bg-accent/30 cursor-pointer px-3 py-1 transition-colors"
                    onClick={() =>
                        onSelect({
                            id: college.id,
                            description: college.description,
                        })
                    }
                >
                    <strong>{college.id}</strong> — {college.description}
                </li>
            ))}
        </ul>
    )
}
