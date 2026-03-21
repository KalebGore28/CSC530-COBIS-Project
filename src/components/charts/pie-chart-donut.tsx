import { Pie, PieChart } from 'recharts'
import type { GradeKey } from '@/types/grades'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

import { GRADE_DEFINITION } from '@/types/grades'

export type PieChartDonutProps = {
    data: Array<{
        grade: GradeKey
        count: number
    }>
}

export function PieChartDonut({ data }: PieChartDonutProps) {
    // If filtered data is empty, return a message
    if (data.filter((item) => item.count > 0).length === 0) {
        return (
            <p className="text-muted-foreground text-center text-sm">
                No valid grade data available
            </p>
        )
    }

    // Add total and colors to each data point
    const dataWithColors = data
        .filter((item) => item.count > 0)
        .map((item) => {
            return {
                name: item.grade,
                value: item.count,
                fill: GRADE_DEFINITION[item.grade].bgVar,
                stroke: GRADE_DEFINITION[item.grade].borderVar,
                strokeWidth: 2,
            }
        })

    return (
        <div className="mx-auto aspect-square max-h-62.5">
            <ChartContainer
                config={{}}
                className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-62.5 pb-0"
            >
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={dataWithColors}
                        dataKey="value"
                        label
                        nameKey="name"
                    />
                </PieChart>
            </ChartContainer>
        </div>
    )
}
