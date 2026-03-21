import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { courses, programs } from '@/db/schema'
import type { OperatorVal } from '@/types/operators'
import type { GradeKey } from '@/types/grades'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'

import { ProgramSearchBox } from '@/components/search/program-search'
import { CourseSearchBox } from '@/components/search/course-search'
import { Button } from './ui/button'

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
    const setGpa = (value: number | ReadonlyArray<number>) => {
        const vals = Array.isArray(value) ? value : [value]
        setFilters((f) => ({
            ...f,
            gpaMin: vals[0],
            gpaMax: vals[1],
        }))
    }

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-4">
                {/* Top Filters Section */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Academic Level */}
                    <div className="bg-muted/30 flex flex-col gap-2 rounded-md border p-4">
                        <span className="text-md font-semibold">
                            Academic Level
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {academicLevelOptions.map((level) => (
                                <label
                                    key={level}
                                    htmlFor={`level-${level}`}
                                    className="flex cursor-pointer items-center gap-2 select-none"
                                >
                                    <Checkbox
                                        className="shadow-xs"
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
                    <div className="bg-muted/30 flex flex-col gap-2 rounded-md border p-4">
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
                            <div className="text-muted-foreground flex justify-between text-sm font-medium">
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
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-2">
                {onResetFilters && (
                    <Button
                        variant="outline"
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
                    </Button>
                )}
                {/* Search button with loader when selected */}
                <Button
                    onClick={() => onApplyFilters(filters)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            Running...
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </>
                    ) : (
                        'Run Search'
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
