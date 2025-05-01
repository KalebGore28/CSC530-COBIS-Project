"use client"

import * as React from "react"
import { Area, AreaChart, XAxis, YAxis, LabelList } from "recharts"

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
	E: {
		label: "E",
		color: "hsl(var(--chart-5))",
	},
	"N/A": {
		label: "N/A",
		color: "hsl(var(--chart-6))",
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
				"E": { count: 0, percentage: 0 },
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
									left: 20,
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
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									minTickGap={32}
									padding={{ left: 20 }}
								/>
								<YAxis
									width={40}
									tickLine={false}
									axisLine={false}
									tickCount={6}
									tickFormatter={(value) => `${value.toFixed(0)}%`}
									domain={[0, 100]}
									label={{
										value: "Percentage of Grades",
										angle: -90,
										position: "insideLeft",
										offset: -5,
										style: {
											textAnchor: "middle",
											fill: "var(--text-secondary)",
											fontSize: 12,
										},
									}}
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
									>
										<LabelList
											dataKey={grade}
											position="bottom"               // try "inside", "insideBottom", "insideTopLeft", etc.
											offset={0}
											content={(renderProps) => <CustomizedLabel {...renderProps} dataKey={grade} />}

										/>

									</Area>
								))}
								<ChartLegend
									content={<ChartLegendContent />}
									verticalAlign="top"
								/>
							</AreaChart>
						</ChartContainer>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Custom Label Component for LabelList
const CustomizedLabel = (props: any) => {
	// Extract props passed by LabelList
	// x, y: Coordinates of the anchor point on the chart for the label
	// value: The data value for this label
	// dataKey: The key associated with this data (e.g., "A", "B")
	// index: The index of the data point in the dataset
	const { x, y, value, dataKey } = props;

	// --- Configuration ---
	const MIN_PERCENTAGE_TO_SHOW = 5; // Only show labels for >= 5%
	const VERTICAL_OFFSET = 15;       // How far below the point to place the label
	const FONT_SIZE = 10;

	// --- Logic ---
	// 1. Basic Validation: Ensure coordinates are valid numbers
	if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
		return null; // Don't render if position is invalid
	}

	// 2. Threshold Check: Hide label if the value is too small
	if (value < MIN_PERCENTAGE_TO_SHOW) {
		return null;
	}

	// 3. Format the Label Text
	const labelText = `${dataKey}-${value.toFixed(0)}%`;

	// --- Rendering ---
	// Render a <text> SVG element
	// x, y: Position attributes
	// dy: Vertical shift from the 'y' coordinate
	// textAnchor="middle": Center the text horizontally at the 'x' coordinate
	// dominantBaseline="middle": Helps center text vertically (adjust if needed)
	// fill, fontSize: Styling
	return (
		<text
			x={x}
			y={y}
			dy={VERTICAL_OFFSET} // Apply the vertical offset
			fill="var(--primary)"      // ← use your CSS var
			fontSize={FONT_SIZE}
			textAnchor="middle"
			dominantBaseline="middle" // Try 'hanging' or remove if vertical alignment is off
		>
			{labelText}
		</text>
	);
};