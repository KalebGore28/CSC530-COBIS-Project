"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Term } from "./term-selector";
import { SkeletonCard } from "@/components/loading/selector-skeleton";
import { gql } from "graphql-request";

/**
 * Course interface representing a course from the API
 */
export interface Course {
	termName: string;
	termCode: string;
	year: number;
	courseId: string;
	courseTitle: string;
	courseSubject: string;
	courseNumber: number;
	courseSuffix: string;
	courseSection: string;
	crn: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
}

/**
 * Props for the CourseSelector component
 */
export interface CourseSelectorProps {
	/** The instructor's M number */
	mnumber: string | null;
	/** The selected term */
	selectedTerm: Term | null;
	/** Callback function when course is selected */
	onCourseSelect?: (course: Course) => void;
	/** Callback function when error occurs */
	onError?: (error: any) => void;
	/** Whether to show course statistics (default: true) */
	showStats?: boolean;
}

const GRAPHQL_ENDPOINT = "/api/graphql";

const GET_COURSES = gql`
  query GetInstructorCourses(
    $mnumber: String!
    $term: String!
    $year: Int!
  ) {
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
      }
    }
  }
`;

const GET_COURSE_STATS = gql`
  query GetCourseStats(
    $mnumber: String!
    $term: String!
    $year: Int!
    $courseId: String!
  ) {
    instructor(mnumber: $mnumber) {
      courses_taught(
        startTerm: $term
        startYear: $year
        endTerm: $term
        endYear: $year
        courseId: $courseId
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
	onError,
	showStats = true,
}) => {
	const [courses, setCourses] = useState<Course[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [statsLoading, setStatsLoading] = useState<boolean>(false);

	const fetchGraphQL = async (query: string, variables: any) => {
		const res = await fetch(GRAPHQL_ENDPOINT, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, variables }),
		});
		const json = await res.json();
		if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join("; "));
		return json.data;
	};


	// Use stable callbacks to prevent unnecessary re-renders
	const notifyCourseSelection = useCallback((course: Course) => {
		if (onCourseSelect) {
			onCourseSelect(course);
		}
	}, [onCourseSelect]);

	const handleError = useCallback((err: any) => {
		console.error("Error fetching courses:", err);
		setError(err.message || "Failed to load courses");
		if (onError) onError(err);
	}, [onError]);

	useEffect(() => {
		if (!mnumber || !selectedTerm) return;

		(async () => {
			try {
				setLoading(true);
				setError(null);
				// 1️⃣ fetch the dropdown options
				const data = await fetchGraphQL(GET_COURSES, {
					mnumber,
					term: selectedTerm.termCode,
					year: selectedTerm.year,
				});
				const raw = data.instructor.courses_taught as Array<any>;
				const list: Course[] = raw.map((ct) => ({
					termName: selectedTerm.termName,
					termCode: selectedTerm.termCode,
					year: selectedTerm.year,
					courseId: `${ct.course.subject}${ct.course.number}${ct.course.suffix}`,
					courseSubject: ct.course.subject,
					courseNumber: ct.course.number,
					courseSuffix: ct.course.suffix,
					courseTitle: ct.course.title,
					courseSection: ct.course_section,
					crn: "",
					creditHours: 0,
					studentCount: 0,
					totalCreditHours: 0,
				}));
				setCourses(list);

				if (list.length) {
					// select first by default
					handleCourseChange(getCourseId(list[0]), list[0]);
				}
			} catch (err: any) {
				handleError(err);
			} finally {
				setLoading(false);
			}
		})();
	}, [mnumber, selectedTerm]);


	const handleCourseChange = async (
		value: string,
		baseCourse?: Course
	) => {
		const course = baseCourse ||
			courses.find((c) => getCourseId(c) === value)!;
		setSelectedCourse(course);
		notifyCourseSelection(course);

		try {
			setStatsLoading(true);
			// 2️⃣ fetch student/crn/credit‐hours info
			const data = await fetchGraphQL(GET_COURSE_STATS, {
				mnumber,
				term: selectedTerm!.termCode,
				year: selectedTerm!.year,
				courseId: course.courseId,
			});
			const taught = data.instructor.courses_taught as Array<any>;

			// usually only one element, but just in case:
			let studentCount = 0;
			let totalCredit = 0;
			let crn = "";
			for (const c of taught) {
				studentCount += c.students.length;
				totalCredit += c.students.reduce((sum: number, s: any) => sum + s.course_hours, 0);
				crn = c.crn;
			}

			const full: Course = {
				...course,
				studentCount,
				creditHours: taught[0]?.students[0]?.course_hours || 0,
				totalCreditHours: totalCredit,
				crn,
			};
			setSelectedCourse(full);
			notifyCourseSelection(full);
		} catch (err: any) {
			handleError(err);
		} finally {
			setStatsLoading(false);
		}
	};


	// Format course for display: "SUBJ 1234-01: Course Title"
	const formatCourseDisplay = (course: Course) => {
		return `${course.courseSubject} ${course.courseNumber}${course.courseSuffix}-${course.courseSection}: ${course.courseTitle}`;
	};

	// Create a unique ID for each course
	const getCourseId = (course: Course) => {
		return `${course.courseId}-${course.courseSection}`;
	};

	if (!selectedTerm) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Selection</CardTitle>
					<CardDescription>
						Please select a term first to view available courses
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (loading) {
		return (
			<SkeletonCard
				showTitle
				showDescription
				showDropdown
			/>
		);
	}

	if (error) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Selection</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (courses.length === 0) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Course Selection</CardTitle>
					<CardDescription>
						No courses found for {selectedTerm.termName} {selectedTerm.year}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Select Course</CardTitle>
				<CardDescription>
					Courses for {selectedTerm.termName} {selectedTerm.year}
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
							<SelectItem key={getCourseId(course)} value={getCourseId(course)}>
								{formatCourseDisplay(course)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</CardContent>

			{showStats && selectedCourse && (
				<CardFooter className="flex flex-wrap gap-2">
					{statsLoading ? (
						<SkeletonCard showDropdown={false} showTitle={false} showDescription />
					) : (
						<>
							<Badge variant="outline" className="bg-yellow-50">
								{selectedCourse.creditHours} Credit Hours
							</Badge>
							<Badge variant="outline" className="bg-green-50">
								{selectedCourse.studentCount} {selectedCourse.studentCount === 1 ? "Student" : "Students"}
							</Badge>
							<Badge variant="outline" className="bg-purple-50">
								{selectedCourse.totalCreditHours} Total Credit Hours
							</Badge>
						</>
					)}
				</CardFooter>
			)}

		</Card>
	);
};

export default CourseSelector;