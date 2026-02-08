import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/components/ui/chart'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

// same config as before
const chartConfig = {
    overall_gpa: {
        label: 'Overall',
        color: 'var(--chart-1)',
    },
    msu_gpa: {
        label: 'MSU',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig

// Define the shape of one point of incoming data
interface GPATrendPoint {
    overall_gpa: number
    msu_gpa: number
    year_term: string
}

type GPATrendChartProps = {
    gpaTrend: Array<GPATrendPoint>
}

export const GPATrendChart = ({ gpaTrend }: GPATrendChartProps) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    GPA Trend
                </CardTitle>
                <CardDescription>
                    GPA trend over the last {gpaTrend.length} terms.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-2">
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={gpaTrend}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year_term" tickMargin={8} />
                        <YAxis
                            tickCount={5}
                            ticks={[0, 1, 2, 3, 4]}
                            label={{
                                value: 'GPA',
                                angle: -90,
                                position: 'insideLeft',

                                style: {

                                    textAnchor: 'middle',
                                },
                            }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            dataKey="overall_gpa"
                            name={chartConfig.overall_gpa.label}
                            type="monotone"
                            stroke={chartConfig.overall_gpa.color}
                            strokeWidth={2}
                        />
                        <Line
                            dataKey="msu_gpa"
                            name={chartConfig.msu_gpa.label}
                            type="monotone"
                            stroke={chartConfig.msu_gpa.color}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        {/* e.g. compute the delta between first & last overall_gpa */}
                        {gpaTrend.length >= 2 &&
                            (() => {
                                const first = gpaTrend[0].overall_gpa
                                const last =
                                    gpaTrend[gpaTrend.length - 1].overall_gpa
                                const pct =
                                    ((last - first) / (first || 1)) * 100
                                return (
                                    <>
                                        {pct >= 0 ? '↑' : '↓'}{' '}
                                        {Math.abs(pct).toFixed(1)}% since{' '}
                                        {gpaTrend[0].year_term}
                                    </>
                                )
                            })()}
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
