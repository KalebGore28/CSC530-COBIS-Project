import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { RosterSummaryCard } from "@/components/roster/roster-summary-card";
import { RosterStudents } from "@/components/roster/roster-students";

// Import types
import type { ExtendedCourse } from "@/components/selectors/course-selector";
import type { RosterStudent } from "@/components/roster/roster-students";
import type { Grade, GradeDistribution } from "@/components/charts/pie-chart-donut";
import { VALID_GRADES } from "@/components/charts/pie-chart-donut";

// GraphQL imports
import type { rosterQuery } from "./__generated__/rosterQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

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
					middle_name
					suffix
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

	// Extract course data
	const courseData = data?.instructor?.courses_taught?.[0];
	if (!courseData) {
		return <div>No course data available</div>;
	}

	// Map students data to RosterStudent type
	const students: RosterStudent[] = courseData.students?.map((s) => ({
		mnumber: s.student.email, // Assuming email is unique; adjust if mnumber is available
		first_name: s.student.first_name,
		last_name: s.student.last_name,
		middle_name: s.student.middle_name || "",
		suffix: s.student.suffix || "",
		email: s.student.email,
		programs: s.student.programs?.map((p) => ({
			code: p.program.code,
			description: p.program.description,
		})) || [],
		midterm_grade: s.midterm_grade || "N/A",
		final_grade: s.final_grade || "N/A",
	})) || [];

	// Calculate grade distributions
	const gradeCounts = (grades: (string | null | undefined)[]): GradeDistribution[] => {
		const gradeMap: { [key in Grade]: number } = {
			A: 0,
			B: 0,
			C: 0,
			D: 0,
			E: 0,
			"N/A": 0,
		};
		grades.forEach((grade) => {
			const key = grade && VALID_GRADES.includes(grade as Grade) ? grade : "N/A";
			gradeMap[key as Grade]++;
		});
		return VALID_GRADES.map((grade) => ({
			grade,
			count: gradeMap[grade],
		}));
	};

	const midtermGrades = courseData.students?.map((s) => s.midterm_grade) || [];
	const finalGrades = courseData.students?.map((s) => s.final_grade) || [];

	// map the courseData to a course object as ExtendedCourse
	const course = {
		subject: courseData.course.subject,
		number: courseData.course.number,
		suffix: courseData.course.suffix,
		title: courseData.course.title,
		course_section: courseData.course_section,
		creditHours: courseData.credit_hour,
		studentCount: courseData.total_students,
		totalCreditHours: courseData.total_credit_hours,
		term: {
			code: courseData.term.code,
			description: courseData.term.description,
			year: selectedCourse.term.year,
		},
	} as ExtendedCourse;

	return (
		<div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
			<RosterInfoCard course={course} className="col-span-2" />

			<RosterGradeDistributions
				gradesData={{
					final_grades: gradeCounts(finalGrades),
					midterm_grades: gradeCounts(midtermGrades),
				}}
			/>
			<RosterSummaryCard
				totalStudents={courseData.total_students || 0}
				classGPA={courseData.class_gpa || 0}
				midtermAverage={courseData.midterm_average || 0}
				finalAverage={courseData.final_average || 0}
			/>
			<RosterStudents
				students={students}
				course={selectedCourse}
				className="col-span-2"
			/>
		</div>
	);
};