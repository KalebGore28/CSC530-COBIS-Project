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
import { SkeletonCard } from "@/components/loading/skeleton";

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
	courseNumber: string;
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
		const fetchCourses = async () => {
			// Reset state when term changes
			setSelectedCourse(null);
			setCourses([]);

			if (!selectedTerm || !mnumber) {
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await axios.get(`/api/instructor/${mnumber}/courses`, {
					params: {
						term: selectedTerm.termCode,
						year: selectedTerm.year
					},
					withCredentials: true,
				});

				if (response.data.courseDetails && Array.isArray(response.data.courseDetails)) {
					// Sort courses by subject, number, and section
					const sortedCourses = [...response.data.courseDetails].sort((a, b) => {
						if (a.courseSubject !== b.courseSubject) return a.courseSubject.localeCompare(b.courseSubject);
						if (a.courseNumber !== b.courseNumber) return a.courseNumber.localeCompare(b.courseNumber);
						return a.courseSection.localeCompare(b.courseSection);
					});

					setCourses(sortedCourses);

					// Select the first course by default if available
					if (sortedCourses.length > 0) {
						setSelectedCourse(sortedCourses[0]);
						notifyCourseSelection(sortedCourses[0]);
					}
				} else {
					setCourses([]);
				}
			} catch (err: any) {
				handleError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [mnumber, selectedTerm]);

	const handleCourseChange = (courseId: string) => {
		const course = courses.find(c => c.courseId + "-" + c.courseSection === courseId);
		if (course) {
			setSelectedCourse(course);
			notifyCourseSelection(course);
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
					<Badge variant="outline" className="bg-blue-50">
						CRN: {selectedCourse.crn}
					</Badge>
					<Badge variant="outline" className="bg-green-50">
						{selectedCourse.studentCount} {selectedCourse.studentCount === 1 ? "Student" : "Students"}
					</Badge>
					<Badge variant="outline" className="bg-purple-50">
						{selectedCourse.creditHours} Credit Hours
					</Badge>
				</CardFooter>
			)}
		</Card>
	);
};

export default CourseSelector;