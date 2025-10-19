import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { type ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts"

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const defaultChartConfig: ChartConfig = {
	A: { label: "A", color: "var(--chart-1)" },
	B: { label: "B", color: "var(--chart-2)" },
	C: { label: "C", color: "var(--chart-3)" },
	D: { label: "D", color: "var(--chart-4)" },
	E: { label: "E", color: "var(--chart-5)" },
	"N/A": { label: "N/A", color: "var(--chart-6)" },
}

const termMappings: Record<string, string> = {
	'10': 'Spring',
	'50': 'Summer',
	'80': 'Fall',
	'90': 'Winter'
};

const allGrades = ["A", "B", "C", "D", "E", "N/A"]

const courseGradeDistributionsQuery = graphql(`
	query courseGradeDistributionsQuery(
		$mnumber: String!
		$startTerm: String!
		$startYear: Int!
		$endTerm: String!
		$endYear: Int!
	) {
		facultySingle(where: { mnumber: { eq: $mnumber }}) {
			mnumber
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
`);

export function CourseGradeChart({ mnumber, term, year }: {
	mnumber: string, term: string, year: number
}) {
	const [view, setView] = useState<"midterm" | "final">("final")

	const { data } = useQuery({
		queryKey: ['courseGradeDistributions', mnumber, term, year],
		queryFn: () => execute(courseGradeDistributionsQuery, {
			mnumber,
			startTerm: term,
			startYear: year,
			endTerm: term,
			endYear: year,
		}),
	})

	const gradeDistributionData = data?.facultySingle?.courses_taught || []

	const _allowedGrades = ["A", "B", "C", "D", "E", "N/A"] as const;
	type _AllowedGrade = typeof _allowedGrades[number];

	// Conditionally transform data for chart based on view
	const chartData = gradeDistributionData.map((course) => {
		const distribution =
			view === "final"
				? course?.final_grade_distribution
				: course?.midterm_grade_distribution;

		const record: Record<string, string | number> = {
			course: `${course?.course.subject}${course?.course.number}${course?.course.suffix}-${course?.course_section}`,
		};

		allGrades.forEach((g) => {
			const bucket = distribution?.find((d) => d.grade === g);

			// If grade not in allowed list or bucket missing, mark N/A
			if (!_allowedGrades.includes(g as _AllowedGrade)) {
				record[g] = "N/A";
			} else {
				record[g] = bucket ? bucket.percentage : 0;
			}
		});

		// Optionally: add "N/A" bucket if no grades matched
		if (!record["N/A"]) {
			record["N/A"] = 0;
		}

		return record;
	});

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
				<ChartContainer
					config={defaultChartConfig}
					className="w-full h-60"
				>
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
				</ChartContainer>
			</CardContent>
		</Card>
	);
}