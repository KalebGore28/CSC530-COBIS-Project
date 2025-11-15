import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import {
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts"

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

// same config as before
const chartConfig = {
	overall_gpa: {
		label: "Overall",
		color: "var(--chart-1)",
	},
	msu_gpa: {
		label: "MSU",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig

// Define the shape of one point of incoming data
interface GPATrendPoint {
	overall_gpa: number
	msu_gpa: number
	term: { code: string; description: string }
	year: number
}

type GPATrendChartProps = {
	gpaTrend: GPATrendPoint[]
}

export const GPATrendChart = ({ gpaTrend }: GPATrendChartProps) => {
	// termCode order: Spring(10), Summer(50), Fall(80), Winter(90)
	const TERM_ORDER = [10, 50, 80, 90]

	// memoize transform + sort
	const data = useMemo(() => {
		return [...gpaTrend]
			.sort((a, b) => {
				if (a.year !== b.year) return a.year - b.year
				return (
					TERM_ORDER.indexOf(parseInt(a.term.code, 10)) -
					TERM_ORDER.indexOf(parseInt(b.term.code, 10))
				)
			})
			.map(({ term, year, overall_gpa, msu_gpa }) => ({
				label: `${term.description} ${year}`,
				overall_gpa,
				msu_gpa,
			}))
	}, [gpaTrend])

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4" />
					GPA Trend
				</CardTitle>
				<CardDescription>
					GPA trend over the last {data.length} terms.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="h-[250px] w-full aspect-auto p-0"
				>
					<LineChart
						accessibilityLayer
						data={data}
						margin={{ left: 12, right: 12 }}
					>
						<CartesianGrid vertical={false} />
						<YAxis
							domain={[0, 4]}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickCount={5}
						/>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent />}
						/>
						<Line
							dataKey="overall_gpa"
							name={chartConfig.overall_gpa.label}
							type="monotone"
							stroke={chartConfig.overall_gpa.color}
							strokeWidth={2}
							dot={false}
						/>
						<Line
							dataKey="msu_gpa"
							name={chartConfig.msu_gpa.label}
							type="monotone"
							stroke={chartConfig.msu_gpa.color}
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>

			<CardFooter>
				<div className="flex w-full items-start gap-2 text-sm">
					<div className="flex items-center gap-2 font-medium leading-none">
						{/* e.g. compute the delta between first & last overall_gpa */}
						{data.length >= 2 && (() => {
							const first = data[0].overall_gpa
							const last = data[data.length - 1].overall_gpa
							const pct =
								((last - first) / (first || 1)) * 100
							return (
								<>
									{pct >= 0 ? "↑" : "↓"}{" "}
									{Math.abs(pct).toFixed(1)}% since{" "}
									{data[0].label}
								</>
							)
						})()}
					</div>
				</div>
			</CardFooter>
		</Card>
	)
}
