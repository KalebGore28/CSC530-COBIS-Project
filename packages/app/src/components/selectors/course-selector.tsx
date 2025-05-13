import React, { useState, useEffect } from "react";
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
import { SkeletonCard } from "@/components/loading/selector-skeleton";
import { Course } from "@cobis/types";
import { ExtendedTerm } from "./term-selector";
import type { courseSelectorQuery } from "./__generated__/courseSelectorQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

// Extend the base Course type for component-specific fields
export interface ExtendedCourse extends Course {
	course_section: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
}

export interface CourseSelectorProps {
	mnumber: string | null;
	selectedTerm: ExtendedTerm | null;
	onCourseSelect?: (course: ExtendedCourse) => void;
	showStats?: boolean;
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
        students {
          course_hours
        }
      }
    }
  }
`;

/**
 * CourseSelector Component
 *
 * A component that fetches and displays courses for a selected term.
 */
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

	// Map courses_taught to ExtendedCourse
	const courses: ExtendedCourse[] = (data.instructor?.courses_taught || [])
		.map((courseTaught) => {
			const studentCount = courseTaught.students?.length || 0;
			const creditHours = courseTaught.students?.[0]?.course_hours || 0; // Assume course_hours is same for all students
			const totalCreditHours = courseTaught.students?.reduce(
				(sum, student) => sum + (student.course_hours || 0),
				0
			) || 0;

			return {
				subject: courseTaught.course.subject,
				number: courseTaught.course.number,
				suffix: courseTaught.course.suffix,
				title: courseTaught.course.title,
				course_section: courseTaught.course_section,
				creditHours,
				studentCount,
				totalCreditHours,
			};
		})
		.sort((a, b) => {
			const aDisplay = `${a.subject}${a.number}${a.suffix}-${a.course_section}`;
			const bDisplay = `${b.subject}${b.number}${b.suffix}-${b.course_section}`;
			return aDisplay.localeCompare(bDisplay);
		});

	// Select the first course by default when selectedTerm changes
	useEffect(() => {
		if (courses.length > 0) {
			const firstCourse = courses[0];
			setSelectedCourse(firstCourse);
			onCourseSelect?.(firstCourse);
		} else {
			setSelectedCourse(null);
		}
	}, [selectedTerm]);

	// Handle course selection
	const handleCourseChange = (courseId: string) => {
		const course = courses.find((c) => getCourseId(c) === courseId);
		if (course) {
			setSelectedCourse(course);
			onCourseSelect?.(course);
		}
	};

	// Format course for display: "SUBJ 1234-01: Course Title"
	const formatCourseDisplay = (course: ExtendedCourse) => {
		return `${course.subject} ${course.number}${course.suffix}-${course.course_section}: ${course.title}`;
	};

	// Create a unique ID for each course
	const getCourseId = (course: ExtendedCourse) => {
		return `${course.subject}|${course.number}|${course.suffix}|${course.course_section}`;
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Course</CardTitle>
				<CardDescription>
					Courses for {selectedTerm.description} {selectedTerm.year}
				</CardDescription>
			</CardHeader>
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
							<SelectItem
								key={getCourseId(course)}
								value={getCourseId(course)}
							>
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
		</Card>
	);
};

export default CourseSelector;