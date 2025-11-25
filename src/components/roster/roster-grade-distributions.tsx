import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";

type AllowedGrade = "A" | "B" | "C" | "D" | "E" | "N/A";
type GradeEntry = {
	grade: AllowedGrade;
	count: number;
}

type RequiredStudentCourseProps = {
	midterm_grade: string | null;
	final_grade: string | null;
} & Record<string, unknown>

type RosterGradeDistributionsProps = {
	studentCourses: RequiredStudentCourseProps[];
	className?: string;
	isLoading?: boolean;
}

export function RosterGradeDistributions({ studentCourses, className, isLoading }: RosterGradeDistributionsProps) {
	const [gradeType, setGradeType] = useState<"midterm" | "final">("final");

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<CardTitle>Grade Distributions</CardTitle>
						<CardDescription className="text-sm text-muted-foreground">
							Loading grade distributions...
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<p>Loading data...</p>
				</CardContent>
			</Card>
		);
	}

	const midtermGrades: GradeEntry[] = [];
	const finalGrades: GradeEntry[] = [];

	studentCourses.forEach((sc) => {
		const midtermGrade = sc.midterm_grade ? sc.midterm_grade : "N/A";
		const finalGrade = sc.final_grade ? sc.final_grade : "N/A";

		const midtermEntry = midtermGrades.find((entry) => entry.grade === midtermGrade);
		if (midtermEntry) {
			midtermEntry.count += 1;
		} else {
			midtermGrades.push({ grade: midtermGrade as AllowedGrade, count: 1 });
		}

		const finalEntry = finalGrades.find((entry) => entry.grade === finalGrade);
		if (finalEntry) {
			finalEntry.count += 1;
		} else {
			finalGrades.push({ grade: finalGrade as AllowedGrade, count: 1 });
		}
	});

	return (
		<Card className={className}>
			<CardHeader className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<CardTitle>Grade Distributions</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						{gradeType === "midterm" ? "Midterm grade distribution" : "Final grade distribution"}
					</CardDescription>
				</div>
				<div className="space-x-2 flex-none">
					<Button
						size="sm"
						variant={gradeType === "midterm" ? "default" : "outline"}
						onClick={() => setGradeType("midterm")}
					>
						Midterm
					</Button>
					<Button
						size="sm"
						variant={gradeType === "final" ? "default" : "outline"}
						onClick={() => setGradeType("final")}
					>
						Final
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<PieChartDonut
					data={gradeType === "midterm" ? midtermGrades : finalGrades}
				/>
			</CardContent>
		</Card>
	);
};