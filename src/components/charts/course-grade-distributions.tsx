import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { GradeKey } from '@/types/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

import { GRADE_DEFINITION } from '@/types/grades'

type GradeEntry = {
    course_id: string
} & Record<GradeKey, number>

type RequiredStudentCourseProps = {
    course_id: string
    course_section: string
    midterm_grade: string | null
    final_grade: string | null
} & Record<string, unknown>

type CourseGradeChartProps = {
    studentCourses: Array<RequiredStudentCourseProps>
}

export function CourseGradeChart({ studentCourses }: CourseGradeChartProps) {
    const [view, setView] = useState<'midterm' | 'final'>('final')

    const gradeKeys = Object.keys(GRADE_DEFINITION) as Array<GradeKey>

    const courseMidtermData = Object.values(
        studentCourses.reduce(
            (acc, course) => {
                if (!course.midterm_grade) return acc

                const grade = course.midterm_grade as GradeKey

                if (!acc[course.course_id]) {
                    acc[course.course_id] = {
                        course_id: course.course_id,
                        ...Object.fromEntries(gradeKeys.map((g) => [g, 0])),
                    } as GradeEntry
                }

                acc[course.course_id][grade]++
                return acc
            },
            {} as Record<string, GradeEntry>,
        ),
    )

    const courseFinalData = Object.values(
        studentCourses.reduce(
            (acc, course) => {
                if (!course.final_grade) return acc

                const grade = course.final_grade as GradeKey

                if (!acc[course.course_id]) {
                    acc[course.course_id] = {
                        course_id: course.course_id,
                        ...Object.fromEntries(gradeKeys.map((g) => [g, 0])),
                    } as GradeEntry
                }

                acc[course.course_id][grade]++
                return acc
            },
            {} as Record<string, GradeEntry>,
        ),
    )

    const courseMidtermPercentages = Object.values(
        courseMidtermData.map((course) => {
            const total = gradeKeys.reduce((sum, g) => sum + course[g], 0)
            if (total === 0) return course
            return {
                ...course,
                ...Object.fromEntries(
                    gradeKeys.map((g) => [g, (course[g] / total) * 100]),
                ),
            }
        }),
    )

    const courseFinalPercentages = Object.values(
        courseFinalData.map((course) => {
            const total = gradeKeys.reduce((sum, g) => sum + course[g], 0)
            if (total === 0) return course
            return {
                ...course,
                ...Object.fromEntries(
                    gradeKeys.map((g) => [g, (course[g] / total) * 100]),
                ),
            }
        }),
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>
                        {view === 'final' ? 'Final' : 'Midterm'} Grade
                        Distribution
                    </CardTitle>
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
                </div>
            </CardHeader>
            <CardContent className="h-64 w-full p-2">
                <ChartContainer
                    config={{}}
                    className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-auto h-full pb-0"
                >
                    <BarChart
                        data={
                            view === 'final'
                                ? courseFinalPercentages
                                : courseMidtermPercentages
                        }
                        margin={{ right: 30, left: 30 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="course_id" tickMargin={8} />
                        <YAxis
                            tickCount={5}
                            tickMargin={8}
                            tickFormatter={(v) => `${v}%`}
                            ticks={[0, 25, 50, 75, 100]}
                            label={{
                                value: 'Percentage of Course Grades',
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
                                <Bar
                                    type="basis"
                                    dataKey={grade}
                                    stackId="grades"
                                    key={grade}
                                    stroke={config.borderVar}
                                    fill={config.borderVar}
                                />
                            ),
                        )}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
