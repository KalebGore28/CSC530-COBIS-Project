"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

// Define types for chart data and props
export type GradeDistribution = {
	grade: string
	count: number
}

type PieChartDonutProps = {
	data: GradeDistribution[]
	title?: string
	description?: string
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		const totalCount = payload[0].value;
		const total = payload[0].payload.allTotal ||
			payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
		const percentage = totalCount / total * 100;

		return (
			<div className="bg-white p-2 shadow rounded border border-gray-200">
				<p className="font-semibold">{`${data.grade}: ${data.count}`}</p>
				<p className="text-sm text-gray-500">{`${percentage.toFixed(2)}%`}</p>
			</div>
		);
	}
	return null;
};

// Default grade colors if not provided
const DEFAULT_COLORS = {
	'A': 'var(--chart-1)',
	'B': 'var(--chart-2)',
	'C': 'var(--chart-3)',
	'D': 'var(--chart-4)',
	'F': 'var(--chart-5)',
};

export function PieChartDonut({
	data,
	title = "Grade Distribution",
	description = "Course grade breakdown"
}: PieChartDonutProps) {

	// If data is empty, return a card with a message
	if (data.length === 0) {
		return (
			<Card className="flex flex-col">
				<p className="text-center text-sm text-muted-foreground">
					No data available
				</p>
			</Card>
		)
	}

	// Calculate total for percentage calculations
	const total = data.reduce((sum, item) => sum + item.count, 0);

	// Add total to each data point for tooltip calculation and ensure colors
	const dataWithTotal = data.map(item => ({
		...item,
		allTotal: total,
		color: DEFAULT_COLORS[item.grade as keyof typeof DEFAULT_COLORS] || '#999'
	}));

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<div className="mx-auto aspect-square max-h-[250px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Tooltip content={<CustomTooltip />} />
							<Pie
								data={dataWithTotal}
								dataKey="count"
								nameKey="grade"
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								paddingAngle={2}
								label={({ grade }) => grade}
							>
								{dataWithTotal.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}
