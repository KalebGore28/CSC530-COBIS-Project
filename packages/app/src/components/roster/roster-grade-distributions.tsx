import React, { useMemo, useState } from "react"; // Add useState import
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";

// Import types
import type { GradeDistribution } from "@/components/charts/pie-chart-donut";

type GradesData = {
	final_grades: GradeDistribution[];
	midterm_grades: GradeDistribution[];
};

type RosterGradeDistributionsProps = {
	gradesData: GradesData;
};

export const RosterGradeDistributions: React.FC<RosterGradeDistributionsProps> = ({
	gradesData,
}) => {
	const { final_grades, midterm_grades } = gradesData;

	// Add state to manage grade type
	const [gradeType, setGradeType] = useState<"midterm" | "final">("midterm");

	// Memoize the data to avoid unnecessary re-renders
	const finalGradesData = useMemo(() => final_grades, [final_grades]);
	const midtermGradesData = useMemo(() => midterm_grades, [midterm_grades]);

	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div>
					<CardTitle>Grade Distributions</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						{gradeType === "midterm"
							? "Midterm grade distribution"
							: "Final grade distribution"}
					</CardDescription>
				</div>
				<div className="space-x-2">
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
					data={gradeType === "midterm" ? midtermGradesData : finalGradesData}
				/>
			</CardContent>
		</Card>
	);
};