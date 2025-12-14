import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { and, eq, gte, useLiveQuery } from '@tanstack/react-db'
import type { ChartConfig } from '@/components/ui/chart'
import {
    ChartContainer,
    ChartLegend,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useCurrentTerm } from '@/providers/current-term-provider'
import { termsCollection } from '@/collections/terms'
import { studentCoursesCollection } from '@/collections/student-courses'

const defaultChartConfig: ChartConfig = {
    A: { label: 'A', color: 'var(--chart-1)' },
    B: { label: 'B', color: 'var(--chart-2)' },
    C: { label: 'C', color: 'var(--chart-3)' },
    D: { label: 'D', color: 'var(--chart-4)' },
    E: { label: 'E', color: 'var(--chart-5)' },
    'N/A': { label: 'N/A', color: 'var(--chart-6)' },
}

type AllowedGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'N/A'
type GradeEntry = {
    year_term: string
} & Record<AllowedGrade, number>

type RequiredStudentCourseProps = {
    year: number
    term: string | undefined
    midterm_grade: string | null
    final_grade: string | null
} & Record<string, unknown>

function convertToPercentages(data: Array<GradeEntry>) {
    return data.map((entry) => {
        const total =
            entry.A + entry.B + entry.C + entry.D + entry.E + entry['N/A']

        const pctEntry: GradeEntry = { ...entry }

        if (total > 0) {
            ;(['A', 'B', 'C', 'D', 'E', 'N/A'] as Array<AllowedGrade>).forEach(
                (g) => {
                    pctEntry[g] = Number(((entry[g] / total) * 100).toFixed(2))
                },
            )
        }

        return pctEntry
    })
}

export function TermGradeDistribution({
    mnumber,
    title,
    description,
}: {
    mnumber: string
    title: string
    description: string
}) {
    const { currentTerm } = useCurrentTerm()
    const [offset, setOffset] = useState('1') // in years
    const [view, setView] = useState<'midterm' | 'final'>('final')

    const { data: grade_distribution_data, isLoading } = useLiveQuery((q) =>
        q
            .from({ studentCourse: studentCoursesCollection })
            .where(({ studentCourse }) =>
                and(
                    eq(studentCourse.instructor_mnumber, mnumber),
                    gte(studentCourse.year, currentTerm.year - 10), // Fetch last 10 years for max offset
                ),
            )
            .leftJoin({ term: termsCollection }, ({ studentCourse, term }) =>
                eq(studentCourse.term_code, term.code),
            )
            .select(({ studentCourse, term }) => ({
                year: studentCourse.year,
                term: term?.description,
                midterm_grade: studentCourse.midterm_grade,
                final_grade: studentCourse.final_grade,
            })),
    )

    if (isLoading) {
        return null
    }

    // Filter data based on offset
    const filteredData = grade_distribution_data?.filter(
        (sc) => sc.year >= currentTerm.year - Number(offset),
    )

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
                            <TabsTrigger value="midterm" className="rounded-lg">
                                Midterm
                            </TabsTrigger>
                            <TabsTrigger value="final" className="rounded-lg">
                                Final
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Select offset */}
                    <Select
                        onValueChange={(val) => setOffset(val)}
                        defaultValue="1"
                    >
                        <SelectTrigger
                            className="w-[160px] rounded-lg"
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
            <CardContent className="p-2">
                {!isLoading && (
                    <GradeDistributionChart
                        studentCourses={filteredData}
                        view={view}
                    />
                )}
            </CardContent>
        </Card>
    )
}

type GradeDistributionChartProps = {
    studentCourses: Array<RequiredStudentCourseProps>
    view: 'midterm' | 'final'
}

function GradeDistributionChart({
    studentCourses,
    view,
}: GradeDistributionChartProps) {
    const yearTermMidtermData: Array<GradeEntry> = []
    const yearTermFinalData: Array<GradeEntry> = []

    studentCourses.forEach((sc) => {
        const yearTermKey = `${sc.term} ${sc.year}`

        let yearTermMidtermEntry = yearTermMidtermData.find(
            (entry) => entry.year_term === yearTermKey,
        )
        if (!yearTermMidtermEntry) {
            yearTermMidtermEntry = {
                year_term: yearTermKey,
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                'N/A': 0,
            }
            yearTermMidtermData.push(yearTermMidtermEntry)
        }
        const midtermGrade = sc.midterm_grade ? sc.midterm_grade : 'N/A'
        yearTermMidtermEntry[midtermGrade as AllowedGrade] =
            yearTermMidtermEntry[midtermGrade as AllowedGrade] + 1

        let yearTermFinalEntry = yearTermFinalData.find(
            (entry) => entry.year_term === yearTermKey,
        )
        if (!yearTermFinalEntry) {
            yearTermFinalEntry = {
                year_term: yearTermKey,
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                'N/A': 0,
            }
            yearTermFinalData.push(yearTermFinalEntry)
        }
        const finalGrade = sc.final_grade ? sc.final_grade : 'N/A'
        yearTermFinalEntry[finalGrade as AllowedGrade] =
            yearTermFinalEntry[finalGrade as AllowedGrade] + 1
    })

    const midtermPercentages = convertToPercentages(yearTermMidtermData)
    const finalPercentages = convertToPercentages(yearTermFinalData)

    return (
        <ChartContainer
            config={defaultChartConfig}
            className="aspect-auto h-[400px] w-full"
        >
            <AreaChart
                data={view === 'final' ? finalPercentages : midtermPercentages}
                margin={{
                    top: 40,
                    right: 30,
                    left: 30,
                }}
            >
                <defs>
                    {Object.entries(defaultChartConfig).map(
                        ([grade, config]) => (
                            <linearGradient
                                key={grade}
                                id={`fill${grade}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={config.color}
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={config.color}
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        ),
                    )}
                </defs>
                <CartesianGrid vertical={false} />

                <XAxis
                    dataKey="year_term"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                />
                <YAxis
                    width={40}
                    tickLine={false}
                    axisLine={false}
                    tickCount={6}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    domain={[0, 100]}
                    label={{
                        value: 'Percentage of Grades',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -20,
                        style: {
                            textAnchor: 'middle',
                            fill: 'var(--text-secondary)',
                            fontSize: 12,
                        },
                    }}
                    tickMargin={15}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                {Object.entries(defaultChartConfig).map(([grade, config]) => (
                    <Area
                        key={grade}
                        dataKey={grade}
                        type="natural"
                        fill={`url(#fill${grade})`}
                        stroke={config.color}
                        stackId="a"
                    />
                ))}
                <ChartLegend verticalAlign="bottom" />
            </AreaChart>
        </ChartContainer>
    )
}
