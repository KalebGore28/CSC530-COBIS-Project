import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";
import { Skeleton } from "@/components/ui/skeleton";

import type { ExtendedCourse } from "@/components/selectors/course-selector";

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


// Custom skeleton for RosterGradeDistributions
const RosterGradeDistributionsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
	<Card className={className}>
		<CardContent>
			<div className="flex flex-col md:flex-row justify-between gap-6">
				<div>
					<Skeleton className="h-8 w-[200px] mb-2" />
					<Skeleton className="h-7 w-[150px] mb-2" />
					<Skeleton className="h-5 w-[120px]" />
				</div>
				<div className="flex flex-col justify-between items-end h-full gap-4">
					<Skeleton className="h-6 w-16 rounded-full" />
					<div className="text-right">
						<Skeleton className="h-8 w-32" />
					</div>
				</div>
			</div>
			<div className="mt-4">
				<Skeleton className="h-48 w-full" />
			</div>
		</CardContent>
	</Card>
);

const rosterGradeDistributionsQuery = graphql(`
	query rosterGradeDistributionsQuery(
	$mnumber: String!
	$subject: String!
	$number: Int!
	$suffix: String!
	) {
	instructorCoursesSingle(
		where: {
		mnumber: { eq: $mnumber }
		course_subject: { eq: $subject }
		course_number: { eq: $number }
		course_suffix: { eq: $suffix }
		}
	) {
		course_subject
		course_number
		course_suffix
		course_section
		term_code
		year
		midterm_grade_distribution {
		grade
		count
		}
		final_grade_distribution {
		grade
		count
		}
	}
	}
`);

export function RosterGradeDistributions({ mnumber, course }: { mnumber: string, course: ExtendedCourse; }) {
	const [gradeType, setGradeType] = useState<"midterm" | "final">("final");

	const { data, isLoading } = useQuery({
		queryKey: ['rosterGradeDistributionsQuery', course.course_subject, course.course_number, course.course_suffix],
		queryFn: async () => await execute(rosterGradeDistributionsQuery, {
			mnumber: mnumber,
			subject: course.course_subject,
			number: course.course_number,
			suffix: course.course_suffix,
		}),
	});

	if (isLoading) return <RosterGradeDistributionsSkeleton />;

	const midterm_grades = data?.instructorCoursesSingle?.midterm_grade_distribution || [];
	const final_grades = data?.instructorCoursesSingle?.final_grade_distribution || [];


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