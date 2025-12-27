import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { courses, programs } from '@/db/schema'
import type { OperatorVal } from '@/types/operators'
import type { GradeKey } from '@/types/grades'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

import { ProgramSearchBox } from '@/components/search/program-search'
import { CourseSearchBox } from '@/components/search/course-search'

type Course = typeof courses.$inferSelect
type Program = typeof programs.$inferSelect

export interface FilterState {
    academicLevels?: Array<string>
    gpaMax?: number
    gpaMin?: number

    // Program filters
    program?: Program
    majorOnly?: boolean
    minorOnly?: boolean

    // Course filters
    course?: Course
    taken?: boolean
    operator?: OperatorVal
    grade?: GradeKey
}

interface StudentFiltersProps {
    onApplyFilters: (filters: FilterState) => void
    onResetFilters?: () => void
    isLoading?: boolean
}

export const StudentFilters = ({
    onApplyFilters,
    onResetFilters,
    isLoading,
}: StudentFiltersProps) => {
    const academicLevelOptions = [
        'Freshman',
        'Sophomore',
        'Junior',
        'Senior',
        'Graduate',
    ]

    // academic & GPA
    const [filters, setFilters] = useState<FilterState>({
        academicLevels: [],
        gpaMax: 4.0,
        gpaMin: 0,
        program: undefined,
        course: undefined,
    })

    // Academic Level
    const toggleLevel = (level: string) =>
        setFilters((f) => ({
            ...f,
            academicLevels: (f.academicLevels ?? []).includes(level)
                ? (f.academicLevels ?? []).filter((l) => l !== level)
                : [...(f.academicLevels ?? []), level],
        }))

    // GPA Range
    const setGpa = (vals: Array<number>) =>
        setFilters((f) => ({
            ...f,
            gpaMin: vals[0],
            gpaMax: vals[1],
        }))

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-4">
                {/* Top Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic Level */}
                    <div className="flex flex-col gap-2 border rounded-md p-4 bg-muted/30">
                        <span className="text-md font-semibold">
                            Academic Level
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {academicLevelOptions.map((level) => (
                                <label
                                    key={level}
                                    htmlFor={`level-${level}`}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                >
                                    <Checkbox
                                        checked={(
                                            filters.academicLevels ?? []
                                        ).includes(level)}
                                        onCheckedChange={() =>
                                            toggleLevel(level)
                                        }
                                        id={`level-${level}`}
                                    />
                                    <span className="text-sm">{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* GPA Range */}
                    <div className="flex flex-col gap-2 border rounded-md p-4 bg-muted/30">
                        <span className="text-md font-semibold">GPA Range</span>
                        <div className="flex flex-col gap-2">
                            <Slider
                                value={[
                                    filters.gpaMin ?? 0,
                                    filters.gpaMax ?? 4.0,
                                ]}
                                onValueChange={setGpa}
                                step={0.1}
                                min={0}
                                max={4.0}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                                <span>{(filters.gpaMin ?? 0).toFixed(1)}</span>
                                <span>
                                    {(filters.gpaMax ?? 4.0).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Program & Course Filters */}
                <div className="flex flex-col gap-2">
                    <span className="text-md font-semibold">
                        Program Filter
                    </span>
                    <ProgramSearchBox
                        filterState={filters}
                        onSetFilterState={setFilters}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-md font-semibold">Course Filter</span>
                    <CourseSearchBox
                        filterState={filters}
                        onSetFilterState={setFilters}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                    {onResetFilters && (
                        <button
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition"
                            onClick={() => {
                                setFilters({
                                    academicLevels: [],
                                    gpaMax: 4.0,
                                    gpaMin: 0,
                                    program: undefined,
                                    course: undefined,
                                })
                                onResetFilters()
                            }}
                        >
                            Reset
                        </button>
                    )}
                    {/* Search button with loader when selected */}
                    <button
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => onApplyFilters(filters)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Running...
                                <Loader2 className="animate-spin h-4 w-4" />
                            </>
                        ) : (
                            'Run Search'
                        )}
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
