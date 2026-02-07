import { useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { and, eq, gte, useLiveQuery } from '@tanstack/react-db'
import type {GradeKey} from '@/types/grades';
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
import { GRADE_DEFINITION  } from '@/types/grades'

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

    if (isLoading) {
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

    const midtermTermPercentages = Object.values(
        midtermTermData.map((term) => {
            const total = gradeKeys.reduce((sum, g) => sum + term[g], 0)
            if (total === 0) return term
            return {
                ...term,
                ...Object.fromEntries(
                    gradeKeys.map((g) => [g, (term[g] / total) * 100]),
                ),
            }
        }),
    )

    const finalTermPercentages = Object.values(
        finalTermData.map((term) => {
            const total = gradeKeys.reduce((sum, g) => sum + term[g], 0)
            if (total === 0) return term
            return {
                ...term,
                ...Object.fromEntries(
                    gradeKeys.map((g) => [g, (term[g] / total) * 100]),
                ),
            }
        }),
    )

    // console.log(Object.values(midtermTermPercentages))

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
                        onValueChange={(val) => setOffset(Number(val))}
                        defaultValue={'1'}
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
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={
                            view === 'final'
                                ? midtermTermPercentages
                                : finalTermPercentages
                        }
                        margin={{ top: 40, right: 30, left: 30, bottom: 20 }}
                    >
                        <defs>
                            {Object.entries(GRADE_DEFINITION).map(
                                ([grade, config]) => (
                                    <linearGradient
                                        key={grade}
                                        id={`fill-${grade}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={config.bgVar}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={config.textVar}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                ),
                            )}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickMargin={8} minTickGap={32} />
                        <YAxis
                            width={'auto'}
                            tickCount={5}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => `${value.toFixed(0)}%`}
                            domain={[0, 100]}
                            label={{
                                value: 'Percentage of Grades',
                                angle: -90,
                                position: 'insideLeft',
                                style: {
                                    textAnchor: 'middle',
                                },
                            }}
                        />
                        <Tooltip
                            wrapperClassName="rounded-lg shadow-lg bg-white/20 backdrop-blur-md border border-white/30 opacity-85 hover:bg-white/30 transition"
                            labelClassName="text-red-500"
                            formatter={(item) => `${Number(item).toFixed(2)}%`}
                        />
                        {Object.entries(GRADE_DEFINITION).map(
                            ([grade, config]) => (
                                <Area
                                    type="monotone"
                                    dataKey={grade}
                                    stackId="grades"
                                    key={grade}
                                    stroke={config.borderVar}
                                    fill={`url(#fill-${grade})`}
                                />
                            ),
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
