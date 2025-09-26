import React, { useState, Suspense, useMemo } from "react"
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
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

// GraphQL imports
import type { courseGradeDistributionsQuery } from "./__generated__/courseGradeDistributionsQuery.graphql"
import { graphql, useLazyLoadQuery } from "react-relay";

const defaultChartConfig = {
	A: { label: "A", color: "hsl(var(--chart-1))" },
	B: { label: "B", color: "hsl(var(--chart-2))" },
	C: { label: "C", color: "hsl(var(--chart-3))" },
	D: { label: "D", color: "hsl(var(--chart-4))" },
	E: { label: "E", color: "hsl(var(--chart-5))" },
	"N/A": { label: "N/A", color: "hsl(var(--chart-6))" },
} satisfies ChartConfig


const courseGradeDistributionsQuery = graphql`
	query courseGradeDistributionsQuery(
		$mnumber: String!
		$startTerm: String!
		$startYear: Int!
		$endTerm: String!
		$endYear: Int!
	) {
		instructor(mnumber: $mnumber) {
			courses_taught(startTerm: $startTerm, endTerm: $endTerm, startYear: $startYear, endYear: $endYear) {
				final_grade_distribution {
					grade
					count
					percentage
				}
				midterm_grade_distribution {
					grade
					count
					percentage
				}
				course {
					number
					subject
					suffix
					title
				}
				course_section
			}
		}
	}
`;


export const CourseGradeChart: React.FC<{
	mnumber: string
	term: string
	year: number
}> = ({ mnumber, term, year }) => {
	const [view, setView] = useState<"midterm" | "final">("final")

	const termMappings: Record<string, string> = {
		'10': 'Spring',
		'50': 'Summer',
		'80': 'Fall',
		'90': 'Winter'
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>
							{view === "final" ? "Final" : "Midterm"} Grade Distribution
						</CardTitle>
						<CardDescription>
							Term: {termMappings[term]} {year}
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
				<Suspense fallback={<div>Loading chart...</div>}>
					<CourseGradeChartContent mnumber={mnumber} term={term} year={year} view={view} />
				</Suspense>
			</CardContent>
		</Card>
	);
}

export const CourseGradeChartContent: React.FC<{
	mnumber: string
	term: string
	year: number
	view?: "midterm" | "final"
}> = ({ mnumber, term, year, view }) => {
	const data = useLazyLoadQuery<courseGradeDistributionsQuery>(
		courseGradeDistributionsQuery,
		{
			mnumber,
			startTerm: term,
			startYear: year,
			endTerm: term,
			endYear: year,
		},
		{ fetchPolicy: "store-and-network" }
	)

	if (!data.instructor) {
		return <div>No data found for this instructor.</div>
	}

	const allGrades = ["A", "B", "C", "D", "E", "N/A"] as const

	const chartData = useMemo(() => {
		return data.instructor?.courses_taught.map((ct) => {
			// pick the right distribution based on view
			const dist = view === "final"
				? ct.final_grade_distribution
				: ct.midterm_grade_distribution

			// build the base record with a label for X axis
			const record: Record<string, string | number> = {
				course: `${ct.course.subject}${ct.course.number}${ct.course.suffix}-${ct.course_section}`,
			}

			// fill in each grade — defaulting to 0 if missing
			allGrades.forEach((g) => {
				const bucket = dist.find((d) => d.grade === g)
				record[g] = bucket ? bucket.percentage : 0
			})

			return record
		})
	}, [data.instructor.courses_taught, view])

	return (
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
	);
}