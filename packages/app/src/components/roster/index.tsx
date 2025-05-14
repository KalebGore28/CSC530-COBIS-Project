import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { RosterSummaryCard } from "@/components/roster/roster-summary-card";
import { RosterStudents } from "@/components/roster/roster-students";

// Import types
import type { ExtendedCourse } from "@/components/selectors/course-selector";
import type { RosterStudent } from "@/components/roster/roster-students";

// GraphQL imports
import type { rosterQuery } from "./__generated__/rosterQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";


const studentData: RosterStudent[] = [
	{
		mnumber: "123456789",
		first_name: "John",
		last_name: "Doe",
		email: "johndoe@example.com",
		programs: [
			{
				code: "CS",
				description: "Computer Science",
			},
			{
				code: "MATH",
				description: "Mathematics",
			},
		],
		middle_name: "",
		suffix: "",
		midterm_grade: "A",
		final_grade: "A",
	},
]

export interface ClassRosterProps {
	mnumber: string | null;
	selectedCourse: ExtendedCourse;
	className?: string;
}

const rosterQuery = graphql`
	query rosterQuery(
	$mnumber: String!
	$subject: String!
	$number: Int!
	$suffix: String
	$section: String!
	$startTerm: String!
	$startYear: Int!
	) {
	instructor(mnumber: $mnumber) {
		courses_taught(
		subject: $subject
		number: $number
		suffix: $suffix
		section: $section
		startTerm: $startTerm
		endTerm: $startTerm
		startYear: $startYear
		endYear: $startYear
		) {
			course {
				subject
				number
				suffix
				title
			}
			course_section
			crn
			term {
				code
				description
			}
			total_students
			total_credit_hours
			credit_hour
			class_gpa
			midterm_average
			final_average
			students {
				student {
					first_name
					last_name
					email
					programs {
						program {
							code
							description
						}
					}
				}
				midterm_grade
				final_grade
			}
			}
		}
	}
`;

// Custom skeleton for the Roster component
const RosterSkeleton: React.FC<{ className?: string }> = ({ className }) => (
	<div className={`container p-6 mx-auto space-y-6 ${className}`}>
		<Skeleton className="h-8 w-full" />
		<Skeleton className="h-8 w-full" />
		<Skeleton className="h-8 w-full" />
		<Skeleton className="h-8 w-full" />
	</div>
);

export const Roster: React.FC<ClassRosterProps> = ({
	mnumber,
	selectedCourse,
}) => {
	if (!mnumber) {
		return <Skeleton className="h-8 w-full" />;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<RosterInfoCard course={selectedCourse} className="col-span-2" />
			<Suspense fallback={<RosterSkeleton className="col-span-2" />}>
				<RosterContent mnumber={mnumber} selectedCourse={selectedCourse} className={"col-span-2"} />
			</Suspense>
		</div>
	)
};

const RosterContent: React.FC<ClassRosterProps> = ({
	mnumber,
	selectedCourse,
	className,
}) => {
	if (!mnumber) {
		return <Skeleton className="h-8 w-full" />;
	}

	const data = useLazyLoadQuery<rosterQuery>(
		rosterQuery,
		{
			mnumber: mnumber,
			subject: selectedCourse.subject,
			number: selectedCourse.number,
			suffix: selectedCourse.suffix,
			section: selectedCourse.course_section,
			startTerm: selectedCourse.term.code,
			startYear: selectedCourse.term.year,
		},
		{ fetchPolicy: "store-or-network" }
	);

	console.log("Roster data", data);

	return (
		<div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
			<RosterGradeDistributions
				gradesData={{
					final_grades: [
						{ grade: "A", count: 10 },
						{ grade: "B", count: 5 },
						{ grade: "C", count: 3 },
						{ grade: "D", count: 2 },
						{ grade: "E", count: 1 },
						{ grade: "N/A", count: 0 },
					],
					midterm_grades: [
						{ grade: "A", count: 8 },
						{ grade: "B", count: 6 },
						{ grade: "C", count: 4 },
						{ grade: "D", count: 1 },
						{ grade: "E", count: 0 },
						{ grade: "N/A", count: 0 },
					],
				}}
			/>
			<RosterSummaryCard
				totalStudents={21}
				classGPA={3.5}
				midtermAverage={3.2}
				finalAverage={3.6}
			/>
			<RosterStudents
				students={studentData}
				course={selectedCourse}
				className="col-span-2"
			/>
		</div>
	)

}