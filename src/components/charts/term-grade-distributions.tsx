import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { and, eq, gte, useLiveQuery } from '@tanstack/react-db'
import type { GradeKey } from '@/types/grades'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GRADE_DEFINITION } from '@/types/grades'

import { useCurrentTerm } from '@/providers/current-term-provider'
import { termsCollection } from '@/integrations/tanstack-db/terms'
import { studentCoursesCollection } from '@/integrations/tanstack-db/student-courses'

type TermGradeRow = {
    name: string
} & Record<GradeKey, number>

type TermGradeDistributionProps = {
    mnumber: string
    title: string
    description: string
}

export function TermGradeDistribution({
    mnumber,
    title,
    description,
}: TermGradeDistributionProps) {
    const { currentTerm } = useCurrentTerm()
    const [offset, setOffset] = useState(1) // in years
    const [view, setView] = useState<'midterm' | 'final'>('final')

    const { data: grade_distribution_data, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ studentCourse: studentCoursesCollection })
                .where(({ studentCourse }) =>
                    and(
                        eq(studentCourse.instructor_mnumber, mnumber),
                        gte(studentCourse.year, currentTerm.year - offset), // Fetch last 10 years for max offset
                    ),
                )
                .leftJoin(
                    { term: termsCollection },
                    ({ studentCourse, term }) =>
                        eq(studentCourse.term_id, term.id),
                )
                .select(({ studentCourse, term }) => ({
                    year: studentCourse.year,
                    term: term?.description,
                    midterm_grade:
                        studentCourse.midterm_grade as GradeKey | null,
                    final_grade: studentCourse.final_grade as GradeKey | null,
                })),
        [offset, mnumber, currentTerm],
    )

    if (isLoading === true) {
        return null
    }

    const gradeKeys = Object.keys(GRADE_DEFINITION) as Array<GradeKey>
    const midtermTermData = Object.values(
        grade_distribution_data.reduce(
            (acc, row) => {
                if (!row.midterm_grade || !row.term) return acc

                const termKey = `${row.term} ${row.year}`
                const grade = row.midterm_grade

                if (!acc[termKey]) {
                    acc[termKey] = {
                        name: termKey,
                        ...Object.fromEntries(gradeKeys.map((g) => [g, 0])),
                    } as TermGradeRow
                }

                acc[termKey][grade]++
                return acc
            },
            {} as Record<string, TermGradeRow>,
        ),
    )

    const finalTermData = Object.values(
        grade_distribution_data.reduce(
            (acc, row) => {
                if (!row.final_grade || !row.term) return acc

                const termKey = `${row.term} ${row.year}`
                const grade = row.final_grade

                if (!acc[termKey]) {
                    acc[termKey] = {
                        name: termKey,
                        ...Object.fromEntries(gradeKeys.map((g) => [g, 0])),
                    } as TermGradeRow
                }

                acc[termKey][grade]++
                return acc
            },
            {} as Record<string, TermGradeRow>,
        ),
    )

    const midtermTermPercentages = midtermTermData.map((term) => ({
        ...term,
        ...toRoundedPercentages(term, gradeKeys),
    }))

    const finalTermPercentages = finalTermData.map((term) => ({
        ...term,
        ...toRoundedPercentages(term, gradeKeys),
    }))

    return (
        <Card className="gap-0 flex flex-col">
            <CardHeader className="items-center border-b-0 pb-0">
                {/* Left column: title + description */}
                <div className="text-center sm:text-left">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>

                {/* Right column: fetch / select controls */}
                <div className="flex justify-around sm:justify-start gap-4">
                    {/* Select view */}
                    <Tabs
                        defaultValue="final"
                        onValueChange={(val) =>
                            setView(val as 'midterm' | 'final')
                        }
                    >
                        <TabsList className="rounded-lg">
                            <TabsTrigger value="midterm">Midterm</TabsTrigger>
                            <TabsTrigger value="final">Final</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Select offset */}
                    <Select
                        defaultValue={'1'}
                        onValueChange={(val) => setOffset(Number(val))}
                    >
                        <SelectTrigger
                            className="w-40 rounded-lg"
                            aria-label="Select time range"
                        >
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="10" className="rounded-lg">
                                Last 10 years
                            </SelectItem>
                            <SelectItem value="5" className="rounded-lg">
                                Last 5 years
                            </SelectItem>
                            <SelectItem value="3" className="rounded-lg">
                                Last 3 years
                            </SelectItem>
                            <SelectItem value="2" className="rounded-lg">
                                Last 2 years
                            </SelectItem>
                            <SelectItem value="1" className="rounded-lg">
                                Last year
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-2 w-full h-96">
                <ChartContainer
                    config={{}}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto h-full pb-0 aspect-auto"
                >
                    <AreaChart
                        data={
                            view === 'final'
                                ? midtermTermPercentages
                                : finalTermPercentages
                        }
                        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickMargin={8} />
                        <YAxis
                            tickCount={5}
                            tickMargin={8}
                            tickFormatter={(v) => `${v}%`}
                            ticks={[0, 25, 50, 75, 100]}
                            label={{
                                value: 'Percentage of Grades',
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    textAnchor: 'middle',
                                },
                            }}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                        />
                        {Object.entries(GRADE_DEFINITION).map(
                            ([grade, config]) => (
                                <Area
                                    type="basis"
                                    dataKey={grade}
                                    stackId="grades"
                                    key={grade}
                                    stroke={config.borderVar}
                                    fill={config.bgVar}
                                />
                            ),
                        )}
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function toRoundedPercentages(
    term: TermGradeRow,
    gradeKeys: Array<GradeKey>,
): Record<GradeKey, number> {
    const total = gradeKeys.reduce((s, g) => s + term[g], 0)
    if (total === 0) return term as Record<GradeKey, number>

    // raw %
    const raw = gradeKeys.map((g) => ({
        grade: g,
        value: (term[g] / total) * 100,
    }))

    // round to 2 decimals
    const rounded = raw.map((r) => ({
        ...r,
        value: Math.round(r.value * 100) / 100,
    }))

    // fix remainder
    const sum = rounded.reduce((s, r) => s + r.value, 0)
    const diff = Math.round((100 - sum) * 100) / 100

    if (diff !== 0) {
        // add/subtract remainder to the largest slice
        const target = [...rounded].sort((a, b) => b.value - a.value)[0]
        target.value = Math.round((target.value + diff) * 100) / 100
    }

    return Object.fromEntries(rounded.map((r) => [r.grade, r.value])) as Record<
        GradeKey,
        number
    >
}
