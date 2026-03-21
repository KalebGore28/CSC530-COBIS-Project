import { useState } from 'react'
import { ilike, or, useLiveQuery } from '@tanstack/react-db'
import type { FilterState } from '../student-filter'
import type { programs } from '@/db/schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

import { programsCollection } from '@/integrations/tanstack-db/programs'

type Program = typeof programs.$inferSelect

interface ProgramSearchBoxProps {
    filterState: FilterState
    onSetFilterState: (filterState: FilterState) => void
}

export function ProgramSearchBox({
    filterState,
    onSetFilterState,
}: ProgramSearchBoxProps) {
    const [query, setQuery] = useState('')

    const { data: filteredPrograms, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ programs: programsCollection })
                .where(({ programs }) =>
                    or(
                        ilike(programs.id, `%${query}%`),
                        ilike(programs.description, `%${query}%`),
                    ),
                )
                .orderBy(({ programs }) => programs.id, 'asc')
                .limit(query !== '' ? 10 : 0),
        [query], // Re-run when query changes
    )

    if (isLoading) return <Skeleton className="h-10 w-full" />

    // Grab current selection from filter state
    const selected = filterState.program

    if (selected) {
        return (
            <div className="bg-muted/30 flex flex-col gap-2 rounded-md border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <strong>{selected.id}</strong> — {selected.description}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setQuery('')
                            onSetFilterState({
                                ...filterState,
                                program: undefined,
                            })
                        }}
                    >
                        Remove
                    </Button>
                </div>

                {/* Conditional Major / Minor checkboxes */}
                <div className="flex items-center gap-6 pl-1">
                    {selected.is_major === true && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="major"
                                checked={filterState.majorOnly ?? false}
                                disabled={!selected.is_minor} // disable if only major available
                                onCheckedChange={(checked) => {
                                    const nextMajor = !!checked

                                    // Only toggle if both flags exist
                                    if (selected.is_minor) {
                                        onSetFilterState({
                                            ...filterState,
                                            program: selected,
                                            majorOnly: nextMajor,
                                            minorOnly: !nextMajor,
                                        })
                                    } else {
                                        // If only major exists, force it true + disabled
                                        onSetFilterState({
                                            ...filterState,
                                            program: selected,
                                            majorOnly: true,
                                            minorOnly: false,
                                        })
                                    }
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
                                checked={filterState.minorOnly ?? false}
                                disabled={!selected.is_major} // disable if only minor available
                                onCheckedChange={(checked) => {
                                    const nextMinor = !!checked

                                    // Only toggle if both flags exist
                                    if (selected.is_major) {
                                        onSetFilterState({
                                            ...filterState,
                                            program: selected,
                                            majorOnly: !nextMinor,
                                            minorOnly: nextMinor,
                                        })
                                    } else {
                                        // If only minor exists, force it true + disabled
                                        onSetFilterState({
                                            ...filterState,
                                            program: selected,
                                            majorOnly: false,
                                            minorOnly: true,
                                        })
                                    }
                                }}
                            />
                            <Label htmlFor="minor" className="text-sm">
                                Minor
                            </Label>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search programs..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                }}
            />
            <ProgramResults
                filteredPrograms={filteredPrograms}
                onSelect={(prog) => {
                    onSetFilterState({
                        ...filterState,
                        program: prog,
                        // Default majorOnly if program is major
                        majorOnly: prog.is_major ? true : false,
                        // Only default minorOnly if not major
                        minorOnly:
                            !prog.is_major && prog.is_minor ? true : false,
                    })
                    setQuery('')
                }}
            />
        </div>
    )
}

function ProgramResults({
    filteredPrograms,
    onSelect,
}: {
    filteredPrograms: Array<Program>
    onSelect: (prog: Program) => void
}) {
    if (filteredPrograms.length === 0) return null

    return (
        <ul className="divide-y rounded-md border">
            {filteredPrograms.map((prog) => (
                <li
                    key={prog.id}
                    className="hover:bg-accent/30 cursor-pointer px-3 py-1 transition-colors"
                    onClick={() => onSelect(prog)}
                >
                    <div className="flex w-full flex-wrap items-center justify-start gap-2 space-x-2">
                        <strong>{prog.id}</strong>
                        {prog.description}
                        <div className="space-x-2">
                            {prog.is_major && (
                                <Badge
                                    variant="outline"
                                    className="border-green-800 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                >
                                    Major
                                </Badge>
                            )}
                            {prog.is_minor && (
                                <Badge
                                    variant="outline"
                                    className="border-blue-800 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                >
                                    Minor
                                </Badge>
                            )}
                            {prog.has_concentration && (
                                <Badge
                                    variant="outline"
                                    className="border-purple-800 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                                >
                                    Concentration
                                </Badge>
                            )}
                            {prog.is_discontinued && (
                                <Badge
                                    variant="outline"
                                    className="border-red-800 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                >
                                    Discontinued
                                </Badge>
                            )}
                            {prog.is_aacsb && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-800 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                                >
                                    AACSB
                                </Badge>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}
