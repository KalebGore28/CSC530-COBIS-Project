import React, { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import type { ChartConfig } from '@/components/ui/chart'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

export interface Enrollment {
    term_code: '10' | '50' | '80' | '90'
    year: number
}

const termMap: Record<string, 'Spring' | 'Summer' | 'Fall' | 'Winter'> = {
    '10': 'Spring',
    '50': 'Summer',
    '80': 'Fall',
    '90': 'Winter',
}
// We need a numeric order so that "Spring" < "Summer" < "Fall" < "Winter" within each year.
const termOrder: Record<string, number> = {
    '10': 1, // Spring
    '50': 2, // Summer
    '80': 3, // Fall
    '90': 4, // Winter
}

const chartConfig = {
    count: {
        label: 'Enrollment Count',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

export interface EnrollmentTrendsProps {
    enrollments: Array<Enrollment>
    title?: string
    description?: string
    className?: string
}

export const EnrollmentTrends: React.FC<EnrollmentTrendsProps> = ({
    enrollments,
    title = 'Program Enrollments Over Time',
    description,
    className = '',
}: EnrollmentTrendsProps) => {
    const chartData = useMemo(() => {
        // Temporary map: “year → termCode → count”
        const bucket: Record<number, Record<string, number>> = {}

        for (const e of enrollments) {
            const y = e.year
            const code = e.term_code
            if (!bucket[y]) {
                bucket[y] = {}
            }
            if (!bucket[y][code]) {
                bucket[y][code] = 0
            }
            bucket[y][code]++
        }

        // Build a flat array of { label, count, sortKey }
        const rows: Array<{ label: string; count: number; sortKey: number }> =
            []

        for (const [yearStr, termCounts] of Object.entries(bucket)) {
            const yearNum = Number(yearStr)
            for (const [code, count] of Object.entries(termCounts)) {
                const label = `${termMap[code]} ${yearNum}`
                // e.g. sortKey = 2023*10 + termOrder["10"] (which is 1) → 20231 for Spring 2023
                const sortKey = yearNum * 10 + termOrder[code]
                rows.push({ label, count, sortKey })
            }
        }

        // Sort ascending by sortKey
        rows.sort((a, b) => a.sortKey - b.sortKey)

        // Finally, strip out sortKey and just return [{ label, count }, …]
        return rows.map(({ label, count }) => ({ label, count }))
    }, [enrollments])

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <CardDescription className="text-xs font-semibold text-gray-500 uppercase tracking-wide ">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-60"
                >
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 12, bottom: 10 }}
                    >
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            width={30}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />

                        <Line
                            dataKey="count"
                            type="natural"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--chart-1)' }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
