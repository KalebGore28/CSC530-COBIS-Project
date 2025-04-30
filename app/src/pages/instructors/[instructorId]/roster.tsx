import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Course } from "@/components/selectors/course-selector";


/**
 * Student interface representing a student in the class roster
 */
export interface Student {
	mnumber: string;
	name: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffix: string;
	email: string;
	major: string;
	finalGrade: string;
	midtermGrade: string;
	registrationStatus: string;
	instructionalMethod: string;
	lastAttendance: string | null;
	overallGpa: number;
	overallEarnedHours: number;
}

/**
 * Course info from roster response
 */
export interface RosterCourse {
	courseId: string;
	courseSubject: string;
	courseNumber: string;
	courseSuffix: string;
	courseSection: string;
	courseTitle: string;
	termCode: string;
	termName: string;
	year: number;
	creditHours: number;
}

/**
 * Stats from roster response
 */
export interface RosterStats {
	totalStudents: number;
	totalGraded: number;
	overallGpa: number;
	gradeDistribution: Record<string, number>;
}

/**
 * Course Roster Page
 * 
 * This component displays a class roster for a specific course
 * It uses URL parameters to fetch the roster data
 */
const CourseRosterPage: React.FC = () => {
	// Get URL parameters
	const { mnumber, yearTerm, courseId } = useParams();
	const navigate = useNavigate();
	const termCode = yearTerm?.slice(-2);
	const year = yearTerm?.slice(0, 4);

	// Parse the courseId parameter
	// Expected format: {subject}{number}{optional_suffix}-{section}
	// Example: CSC101-01
	const [courseParams, setCourseParams] = useState<Course | null>(null);


	// Parse courseId on component mount
	useEffect(() => {
		if (courseId) {
			const match = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/);

			if (match) {
				setCourseParams({
					courseSubject: match[1],
					courseNumber: parseInt(match[2]),
					courseSuffix: match[3] || '',
					courseSection: match[4],
					termCode: termCode || '',
					year: parseInt(year)
				});
			}
		}
	}, [courseId]);

	// Navigate back to term details
	const handleBackToTerm = () => {
		navigate(`/instructors/${mnumber}/${yearTerm}`);
	};

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col space-y-6">
				{/* Back button */}
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					onClick={handleBackToTerm}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Term Details
				</Button>
			</div>


		</div>
	);
};

export default CourseRosterPage;