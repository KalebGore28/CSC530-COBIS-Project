import { useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";


import type { ExtendedCourse } from "@/components/selectors/course-selector";
import { graphql, useLazyLoadQuery } from "react-relay";

const rosterGradeDistributionsQuery = graphql`

`;



export function RosterGradeDistributions({ course }: { course: ExtendedCourse }) { };




export function RosterGradeDistributionsContent({ course }: { course: ExtendedCourse; }) {
	const { final_grades, midterm_grades } = gradesData;

	const [gradeType, setGradeType] = useState<"midterm" | "final">("final");

	return (
		<Card>
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
					data={gradeType === "midterm" ? midterm_grades : final_grades}
				/>
			</CardContent>
		</Card>
	);
};