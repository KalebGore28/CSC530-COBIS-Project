"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
	{ browser: "A", grades: 275, fill: "var(--color-chrome)" },
	{ browser: "B", grades: 200, fill: "var(--color-safari)" },
	{ browser: "C", grades: 187, fill: "var(--color-firefox)" },
	{ browser: "D", grades: 173, fill: "var(--color-edge)" },
	{ browser: "F", grades: 90, fill: "var(--color-other)" },
]

const chartConfig = {
	grades: {
		label: "Grades",
	},
	A: {
		label: "A",
		color: "hsl(var(--chart-1))",
	},
	B: {
		label: "B",
		color: "hsl(var(--chart-2))",
	},
	C: {
		label: "C",
		color: "hsl(var(--chart-3))",
	},
	D: {
		label: "D",
		color: "hsl(var(--chart-4))",
	},
	F: {
		label: "F",
		color: "hsl(var(--chart-5))",
	},
} satisfies ChartConfig

export function PieChartDonut() {
	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Pie Chart - Donut</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px]"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={chartData}
							dataKey="grades"
							nameKey="A"
							innerRadius={60}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
