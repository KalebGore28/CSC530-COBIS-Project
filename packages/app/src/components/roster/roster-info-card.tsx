import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import types
import type { ExtendedCourse } from "../selectors/course-selector";

// GraphQL imports
import type { rosterInfoCardQuery } from "./__generated__/rosterInfoCardQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const rosterInfoCardQuery = graphql`
	query rosterInfoCardQuery {
		getCurrentYearTerm {
			year
			term {
				code
				description
			}
		}
	}
`;

// Custom skeleton for RosterInfoCard
const RosterInfoCardSkeleton = () => (
	<Card className="w-full">
		<CardContent className="p-6">
			<div className="flex flex-col md:flex-row justify-between gap-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-[300px]" /> {/* Mimics course title */}
					<Skeleton className="h-7 w-[250px]" /> {/* Mimics course description */}
					<Skeleton className="h-5 w-[220px]" /> {/* Mimics term and credit hours */}
				</div>
				<div className="flex flex-col justify-between items-end h-full gap-4">
					<Skeleton className="h-6 w-16 rounded-full" /> {/* Mimics status badge */}
					<div className="text-right">
						<Skeleton className="h-8 w-32" /> {/* Mimics student count */}
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
);

export interface RosterInfoCardProps {
	course: ExtendedCourse;
}

export const RosterInfoCard: React.FC<RosterInfoCardProps> = ({ course }) => {
	return (
		<Suspense fallback={<RosterInfoCardSkeleton />}>
			<RosterInfoContent course={course} />
		</Suspense>
	);
};

const RosterInfoContent: React.FC<RosterInfoCardProps> = ({ course }) => {
	const { getCurrentYearTerm } = useLazyLoadQuery<rosterInfoCardQuery>(
		rosterInfoCardQuery,
		{},
		{ fetchPolicy: "store-or-network" }
	);

	const isActive = course.term.year === getCurrentYearTerm.year && course.term.code === getCurrentYearTerm.term.code;

	return (
		<Card className="w-full">
			<CardContent>
				<div className="flex flex-col md:flex-row justify-between gap-6">
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{course.subject} {course.number}
							{course.suffix} - {course.course_section}
						</h2>
						<p className="text-xl text-foreground">{course.title}</p>
						<p className="text-sm text-muted-foreground">
							{course.term.description} {course.term.year} • {course.creditHours} Credit Hours (Total Hours: {course.totalCreditHours})
						</p>
					</div>
					<div className="flex flex-col justify-between items-end h-full gap-4">
						<Badge
							variant={isActive ? "default" : "secondary"}
							className="text-sm font-medium rounded-full"
						>
							<span className="text-xs font-normal text-white">
								{isActive ? "Active" : "Completed"}
							</span>
						</Badge>
						<div className="text-right">
							<p className="text-2xl font-bold text-foreground">
								{course.studentCount} <span className="text-lg font-normal text-muted-foreground">students</span>
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};