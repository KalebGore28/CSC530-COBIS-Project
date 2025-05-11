"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { TrendingUp } from "lucide-react"
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer } from "@/components/ui/chart"
import {
	ResponsiveContainer,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Bar,
} from "recharts"
import {
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const defaultChartConfig = {
	A: { label: "A", color: "hsl(var(--chart-1))" },
	B: { label: "B", color: "hsl(var(--chart-2))" },
	C: { label: "C", color: "hsl(var(--chart-3))" },
	D: { label: "D", color: "hsl(var(--chart-4))" },
	E: { label: "E", color: "hsl(var(--chart-5))" },
	"N/A": { label: "N/A", color: "hsl(var(--chart-6))" },
} satisfies ChartConfig

interface CourseDetail {
	courseId: string
	studentCount: number
	midtermDistribution: Record<string, number>
	finalDistribution: Record<string, number>
}

interface CourseGradeChartProps {
	mnumber: string
	term: string
	year: number
}

export const CourseGradeChart: React.FC<CourseGradeChartProps> = ({
	mnumber,
	term,
	year,
}) => {
	const [data, setData] = useState<CourseDetail[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [view, setView] = useState<"midterm" | "final">("final")

	useEffect(() => {
		setLoading(true)
		axios
			.get(`/api/instructor/${mnumber}/courses`, { params: { term, year } })
			.then((resp) => setData(resp.data.courseDetails))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false))
	}, [mnumber, term, year])

	if (loading) return <div>Loading…</div>
	if (error) return <div>Error: {error}</div>
	if (!data.length) return <div>No courses found.</div>

	const chartData = data.map((course) => {
		const dist = view === "final" ? course.finalDistribution : course.midtermDistribution
		return Object.entries(defaultChartConfig).reduce(
			(acc, [grade]) => {
				const count = dist[grade] ?? 0
				acc[grade] = +((count / course.studentCount) * 100).toFixed(1)
				return acc
			},
			{ course: course.courseId } as Record<string, number | string>
		)
	})

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>
							{view === "final" ? "Final" : "Midterm"} Grade Distribution
						</CardTitle>
						<CardDescription>
							Term {term} {year} — Instructor {mnumber}
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Button
							variant={view === "midterm" ? "default" : "outline"}
							size="sm"
							onClick={() => setView("midterm")}
						>
							Midterm
						</Button>
						<Button
							variant={view === "final" ? "default" : "outline"}
							size="sm"
							onClick={() => setView("final")}
						>
							Final
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<ChartContainer
					config={defaultChartConfig}
					className="w-full h-60"
				>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							accessibilityLayer
							barCategoryGap="30%"
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="course"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								angle={0}
								textAnchor="middle"
								interval={0}
							/>
							<YAxis
								domain={[0, 100]}
								ticks={[0, 25, 50, 75, 100]}
								tickFormatter={(v) => `${v}%`}
								axisLine={false}
								tickLine={false}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							{Object.entries(defaultChartConfig).map(
								([grade, cfg]) => (
									<Bar
										key={grade}
										dataKey={grade}
										stackId="a"
										fill={cfg.color}
										fillOpacity={0.6}
										radius={2}
									/>
								)
							)}
						</BarChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>

			<CardFooter className="flex-col items-start gap-1 text-sm">
				<div className="flex gap-1 font-medium">
					Showing {view === "final" ? "final" : "midterm"} grades for {data.length} courses
					<TrendingUp className="h-4 w-4" />
				</div>
				<div className="text-muted-foreground">
					Hover over segments for details
				</div>
			</CardFooter>
		</Card>
	)
}
