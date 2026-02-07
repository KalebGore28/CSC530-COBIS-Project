import { Label, LabelList, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { GradeKey } from '@/types/grades'
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
            <p className="text-center text-sm text-muted-foreground">
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
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={dataWithColors} dataKey="value">
                        <LabelList
                            content={(props) => (
                                <Label
                                    {...props}
                                    className="fill-foreground text-xs font-medium"
                                    position="outside"
                                    offset={10}
                                />
                            )}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
