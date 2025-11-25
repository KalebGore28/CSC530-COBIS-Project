import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { type ChartConfig, ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts"

const chartConfig = {
	A: { label: "A", color: "var(--chart-1)" },
	B: { label: "B", color: "var(--chart-2)" },
	C: { label: "C", color: "var(--chart-3)" },
	D: { label: "D", color: "var(--chart-4)" },
	E: { label: "E", color: "var(--chart-5)" },
	"N/A": { label: "N/A", color: "var(--chart-6)" },
} satisfies ChartConfig;

type AllowedGrade = "A" | "B" | "C" | "D" | "E" | "N/A";
type GradeEntry = {
	course_id: string;
} & Record<AllowedGrade, number>

type RequiredStudentCourseProps = {
	course_id: string;
	course_section: string;
	midterm_grade: string | null;
	final_grade: string | null;
} & Record<string, unknown>

function convertToPercentages(data: GradeEntry[]) {
	return data.map((entry) => {
		const total =
			entry.A +
			entry.B +
			entry.C +
			entry.D +
			entry.E +
			entry["N/A"];

		const pctEntry: GradeEntry = { ...entry };

		if (total > 0) {
			(["A", "B", "C", "D", "E", "N/A"] as AllowedGrade[]).forEach((g) => {
				pctEntry[g] = Number(((entry[g] as number) / total * 100).toFixed(2));
			});
		}

		return pctEntry;
	});
}

type CourseGradeChartProps = {
	studentCourses: RequiredStudentCourseProps[];
}

export function CourseGradeChart({ studentCourses }: CourseGradeChartProps) {
	const [view, setView] = useState<"midterm" | "final">("final")

	const courseMidtermData: GradeEntry[] = [];
	const courseFinalData: GradeEntry[] = [];

	studentCourses.forEach((sc) => {
		const courseKey = `${sc.course_id}-${sc.course_section}`;

		let courseMidtermEntry = courseMidtermData.find((entry) => entry.course_id === courseKey);
		if (!courseMidtermEntry) {
			courseMidtermEntry = { course_id: courseKey, A: 0, B: 0, C: 0, D: 0, E: 0, "N/A": 0 };
			courseMidtermData.push(courseMidtermEntry);
		}
		const midtermGrade = sc.midterm_grade ? sc.midterm_grade : "N/A";
		courseMidtermEntry[midtermGrade as AllowedGrade] = (courseMidtermEntry[midtermGrade as AllowedGrade] as number) + 1;

		let courseFinalEntry = courseFinalData.find((entry) => entry.course_id === courseKey);
		if (!courseFinalEntry) {
			courseFinalEntry = { course_id: courseKey, A: 0, B: 0, C: 0, D: 0, E: 0, "N/A": 0 };
			courseFinalData.push(courseFinalEntry);
		}
		const finalGrade = sc.final_grade ? sc.final_grade : "N/A";
		courseFinalEntry[finalGrade as AllowedGrade] = (courseFinalEntry[finalGrade as AllowedGrade] as number) + 1;
	});

	const midtermPercentages = convertToPercentages(courseMidtermData);
	const finalPercentages = convertToPercentages(courseFinalData);

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-center">
					<div>
						<CardTitle>
							{view === "final" ? "Final" : "Midterm"} Grade Distribution
						</CardTitle>
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
					config={chartConfig}
					className="w-full h-60"
				>
					<BarChart
						data={view === "final" ? finalPercentages : midtermPercentages}
						accessibilityLayer
						barCategoryGap="30%"
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="course_id"
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
						{Object.entries(chartConfig).map(
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