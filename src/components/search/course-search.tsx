import { useState } from 'react'
import { ilike, or, useLiveQuery } from '@tanstack/react-db'
import type { FilterState } from '../student-filter'
import type { OperatorKey } from '@/types/operators'
import type { GradeKey } from '@/types/grades'
import type { courses } from '@/db/schema'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { coursesCollection } from '@/integrations/tanstack-db/courses'

import { OPERATORS } from '@/types/operators'
import { GRADES } from '@/types/grades'

type Course = typeof courses.$inferSelect

interface CourseSearchBoxProps {
    filterState: FilterState
    onSetFilterState: (filterState: FilterState) => void
}

export function CourseSearchBox({
    filterState,
    onSetFilterState,
}: CourseSearchBoxProps) {
    const [query, setQuery] = useState('')

    const { data: filteredCourses, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ courses: coursesCollection })
                .where(({ courses }) =>
                    or(
                        ilike(courses.code, `%${query}%`),
                        ilike(courses.title, `%${query}%`),
                    ),
                )
                .orderBy(({ courses }) => courses.subject, 'asc')
                .orderBy(({ courses }) => courses.number, 'asc')
                .limit(query !== '' ? 10 : 0),
        [query], // Re-run when query changes
    )

    if (isLoading) return <Skeleton className="h-10 w-full" />

    // Grab current selection from filter state
    const selected = filterState.course

    if (selected) {
        return (
            <div className="flex flex-col gap-3 border rounded-md p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                    <span>
                        <strong> {selected.code}</strong> — {selected.title}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setQuery('')
                            onSetFilterState({
                                ...filterState,
                                course: undefined,
                                taken: undefined,
                                operator: undefined,
                                grade: undefined,
                            })
                        }}
                    >
                        Remove
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    {/* Taken / Not Taken Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Taken:</span>
                        <Tabs
                            value={filterState.taken ? 'yes' : 'no'}
                            onValueChange={(val) => {
                                const defaultOperator =
                                    filterState.operator || 'EQ'
                                const defaultGrade = filterState.grade || 'A'
                                onSetFilterState({
                                    ...filterState,
                                    course: selected,
                                    taken: val === 'yes',
                                    // Only set operator/grade if taken
                                    operator:
                                        val === 'yes'
                                            ? defaultOperator
                                            : undefined,
                                    grade:
                                        val === 'yes'
                                            ? defaultGrade
                                            : undefined,
                                })
                            }}
                            className="bg-background border rounded-lg"
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger
                                    value="yes"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Yes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="no"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    No
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Show additional fields only if taken */}
                    {filterState.taken && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Comparison selector */}
                            <div className="flex-1">
                                <Select
                                    value={
                                        Object.keys(OPERATORS).find(
                                            (key) =>
                                                OPERATORS[
                                                    key as OperatorKey
                                                ] === filterState.operator,
                                        ) || ''
                                    }
                                    onValueChange={(val) => {
                                        onSetFilterState({
                                            ...filterState,
                                            course: selected,
                                            taken: filterState.taken,
                                            operator:
                                                OPERATORS[val as OperatorKey],
                                            grade: filterState.grade,
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select comparison" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(OPERATORS).map((op) => (
                                            <SelectItem key={op} value={op}>
                                                {op}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Grade selector */}
                            <div className="flex-1">
                                <Select
                                    value={filterState.grade}
                                    onValueChange={(val) => {
                                        onSetFilterState({
                                            ...filterState,
                                            course: selected,
                                            taken: filterState.taken,
                                            operator: filterState.operator,
                                            grade: val as GradeKey,
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(GRADES).map((grade) => (
                                            <SelectItem
                                                key={grade}
                                                value={grade}
                                            >
                                                {grade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value)
                }}
            />
            <CourseResults
                filteredCourses={filteredCourses}
                onSelect={(course) => {
                    onSetFilterState({
                        ...filterState,
                        course: course,
                        taken: false,
                        operator: undefined,
                        grade: undefined,
                    })
                    setQuery('')
                }}
            />
        </div>
    )
}

function CourseResults({
    filteredCourses,
    onSelect,
}: {
    filteredCourses: Array<Course>
    onSelect: (course: Course) => void
}) {
    if (filteredCourses.length === 0) return null

    return (
        <ul className="border rounded-md divide-y">
            {filteredCourses.map(
                (course) =>
                    course && (
                        <li
                            key={course.code}
                            className="px-3 py-1 cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => {
                                onSelect(course)
                            }}
                        >
                            <strong> {course.code} </strong> — {course.title}
                        </li>
                    ),
            )}
        </ul>
    )
}
