"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

// Define the data structure for grade distribution
export interface GradeDistributionData {
	term: string
	year: number
	totalStudents: number
	distribution: {
		[grade: string]: {
			count: number
			percentage: number
		}
	}
}

// Define the props for the component
interface GradeDistributionsProps {
	data: GradeDistributionData[]
	title?: string
	description?: string
	onTimeRangeChange?: (offset: number) => void
}

// Default chart configuration for grade distributions
const defaultChartConfig = {
	A: {
		label: "A",
		color: "var(--chart-1)",
	},
	B: {
		label: "B",
		color: "var(--chart-2)",
	},
	C: {
		label: "C",
		color: "var(--chart-3)",
	},
	D: {
		label: "D",
		color: "var(--chart-4)",
	},
	F: {
		label: "F",
		color: "var(--chart-5)",
	},
	"N/A": {
		label: "N/A",
		color: "var(--chart-6)",
	},
} satisfies ChartConfig

export function GradeDistributions({
	data,
	title = "Grade Distribution Trends",
	description = "Showing grade distribution trends over time",
	onTimeRangeChange
}: GradeDistributionsProps) {
	const [timeRange, setTimeRange] = React.useState("1y")

	// Handle time range change
	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value)
		// Emit the corresponding offset
		const offset = value === "1y" ? -1 :
			value === "2y" ? -2 :
				value === "3y" ? -3 :
					-5
		onTimeRangeChange?.(offset)
	}

	// Transform the data for the chart
	const chartData = React.useMemo(() => {
		return data.map(item => {
			const termCode = item.term
			const termName = termCode === "10" ? "Spring" :
				termCode === "50" ? "Summer" :
					termCode === "80" ? "Fall" : "Winter"
			const date = `${termName} ${item.year}`

			// Ensure all grades have values (including zeros)
			const distribution = {
				"A": { count: 0, percentage: 0 },
				"B": { count: 0, percentage: 0 },
				"C": { count: 0, percentage: 0 },
				"D": { count: 0, percentage: 0 },
				"F": { count: 0, percentage: 0 },
				"N/A": { count: 0, percentage: 0 },
				...item.distribution
			};

			return {
				date,
				termCode,
				year: item.year,
				...Object.entries(distribution).reduce((acc, [grade, stats]) => {
					acc[grade] = stats.percentage
					return acc
				}, {} as Record<string, number>)
			}
		})
	}, [data])

	const filteredData = React.useMemo(() => {
		return chartData;
	}, [chartData]);

	return (
		<Card>
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1 text-center sm:text-left">
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Select value={timeRange} onValueChange={handleTimeRangeChange}>
						<SelectTrigger
							className="w-[160px] rounded-lg sm:ml-auto"
							aria-label="Select time range"
						>
							<SelectValue placeholder="All time" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							<SelectItem value="all" className="rounded-lg">
								Last 5 years
							</SelectItem>
							<SelectItem value="3y" className="rounded-lg">
								Last 3 years
							</SelectItem>
							<SelectItem value="2y" className="rounded-lg">
								Last 2 years
							</SelectItem>
							<SelectItem value="1y" className="rounded-lg">
								Last year
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<div className="h-[400px]">
					<div className="w-full h-full">
						<ChartContainer
							config={defaultChartConfig}
							className="w-full h-full"
						>
							<AreaChart
								data={filteredData}
								margin={{
									top: 20,
									right: 20,
									left: 0,
									bottom: 20
								}}
							>
								<defs>
									{Object.entries(defaultChartConfig).map(([grade, config]) => (
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
									))}
								</defs>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={32}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => `${value}%`}
									domain={[0, 100]}
								/>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											indicator="dot"
										/>
									}
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
								<ChartLegend content={<ChartLegendContent />} />
							</AreaChart>
						</ChartContainer>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}