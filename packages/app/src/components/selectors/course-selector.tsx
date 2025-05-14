import React, { useState, useEffect, Suspense } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/loading/selector-skeleton";

// Import types
import type { Course } from "@cobis/types";
import type { ExtendedTerm } from "./term-selector";

// GraphQL imports
import type { courseSelectorQuery } from "./__generated__/courseSelectorQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

export interface ExtendedCourse
	extends Omit<
		Course,
		"hours" | "fee" | "web_fee" | "last_updated" | "department" | "college"
	> {
	course_section: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
	term: ExtendedTerm;
}


const courseSelectorQuery = graphql`
  query courseSelectorQuery($mnumber: String!, $term: String!, $year: Int!) {
    instructor(mnumber: $mnumber) {
      courses_taught(
        startTerm: $term
        startYear: $year
        endTerm: $term
        endYear: $year
      ) {
        course {
          subject
          number
          suffix
          title
        }
        course_section
        crn
        total_students
		total_credit_hours
		credit_hour
      }
    }
  }
`;

// Custom skeleton for CourseSelectorContent
const CourseSelectorSkeleton = () => (
	<>
		<CardContent>
			<Skeleton className="h-8 w-full" /> {/* Mimics SelectTrigger */}
		</CardContent>
		<CardFooter className="flex flex-wrap gap-2">
			<Skeleton className="h-5 w-24" /> {/* Mimics Badge */}
			<Skeleton className="h-5 w-20" /> {/* Mimics Badge */}
			<Skeleton className="h-5 w-28" /> {/* Mimics Badge */}
		</CardFooter>
	</>
);

export interface CourseSelectorProps {
	mnumber: string | null;
	selectedTerm: ExtendedTerm | null;
	onCourseSelect?: (course: ExtendedCourse) => void;
	showStats?: boolean;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
	mnumber,
	selectedTerm,
	onCourseSelect,
	showStats = true,
}) => {
	if (!mnumber) {
		return <SkeletonCard />;
	}

	if (!selectedTerm) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Selection</CardTitle>
					<CardDescription>
						Please select a term first to view available courses
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SkeletonCard showDropdown={false} showTitle={false} showDescription />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Course</CardTitle>
				<CardDescription>
					Courses for {selectedTerm.description} {selectedTerm.year}
				</CardDescription>
			</CardHeader>
			<Suspense fallback={<CourseSelectorSkeleton />}>
				<CourseSelectorContent
					mnumber={mnumber}
					selectedTerm={selectedTerm}
					onCourseSelect={onCourseSelect}
					showStats={showStats}
				/>
			</Suspense>
		</Card>
	);
};

const CourseSelectorContent: React.FC<CourseSelectorProps> = ({
	mnumber,
	selectedTerm,
	onCourseSelect,
	showStats,
}) => {
	if (!mnumber) {
		return <SkeletonCard />;
	}
	if (!selectedTerm) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Selection</CardTitle>
					<CardDescription>
						Please select a term first to view available courses
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SkeletonCard showDropdown={false} showTitle={false} showDescription />
				</CardContent>
			</Card>
		);
	}

	const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

	const data = useLazyLoadQuery<courseSelectorQuery>(
		courseSelectorQuery,
		{
			mnumber,
			term: selectedTerm.code,
			year: selectedTerm.year,
		},
		{ fetchPolicy: "store-or-network" }
	);

	const courses: ExtendedCourse[] = (data.instructor?.courses_taught || [])
		.map((courseTaught) => {
			const studentCount = courseTaught.total_students || 0;
			const creditHours = courseTaught.credit_hour || 0;
			const totalCreditHours =
				courseTaught.total_credit_hours || creditHours * studentCount;

			return {
				subject: courseTaught.course.subject,
				number: courseTaught.course.number,
				suffix: courseTaught.course.suffix,
				title: courseTaught.course.title,
				course_section: courseTaught.course_section,
				creditHours,
				studentCount,
				totalCreditHours,
				term: selectedTerm,
			};
		})
		.sort((a, b) => {
			const aDisplay = `${a.subject}${a.number}${a.suffix}-${a.course_section}`;
			const bDisplay = `${b.subject}${b.number}${b.suffix}-${a.course_section}`;
			return aDisplay.localeCompare(bDisplay);
		});

	useEffect(() => {
		if (courses.length > 0) {
			const firstCourse = courses[0];
			setSelectedCourse(firstCourse);
			onCourseSelect?.(firstCourse);
		} else {
			setSelectedCourse(null);
		}
	}, [selectedTerm]);

	const handleCourseChange = (courseId: string) => {
		const course = courses.find((c) => getCourseId(c) === courseId);
		if (course) {
			setSelectedCourse(course);
			onCourseSelect?.(course);
		}
	};

	const formatCourseDisplay = (course: ExtendedCourse) => {
		return `${course.subject} ${course.number}${course.suffix}-${course.course_section}: ${course.title}`;
	};

	const getCourseId = (course: ExtendedCourse) => {
		return `${course.subject}|${course.number}|${course.suffix}|${course.course_section}`;
	};

	return (
		<>
			<CardContent>
				<Select
					value={selectedCourse ? getCourseId(selectedCourse) : ""}
					onValueChange={handleCourseChange}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a course" />
					</SelectTrigger>
					<SelectContent>
						{courses.map((course) => (
							<SelectItem key={getCourseId(course)} value={getCourseId(course)}>
								{formatCourseDisplay(course)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>
			{showStats && selectedCourse && (
				<CardFooter className="flex flex-wrap gap-2">
					<Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900">
						{selectedCourse.creditHours} Credit Hours
					</Badge>
					<Badge variant="outline" className="bg-green-50 dark:bg-green-900">
						{selectedCourse.studentCount}{" "}
						{selectedCourse.studentCount === 1 ? "Student" : "Students"}
					</Badge>
					<Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
						{selectedCourse.totalCreditHours} Total Credit Hours
					</Badge>
				</CardFooter>
			)}
		</>
	);
};

export default CourseSelector;