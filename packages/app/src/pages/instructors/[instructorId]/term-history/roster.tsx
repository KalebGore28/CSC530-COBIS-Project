import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Roster } from "@/components/roster";

// Import types
import type { ExtendedCourse } from "@/components/selectors/course-selector";


/**
 * Course Roster Page
 * 
 * This component displays a class roster for a specific course
 * It uses URL parameters to fetch the roster data
 */
export const CourseRosterPage: React.FC = () => {
	// Get URL parameters
	const { mnumber, yearTerm, courseId } = useParams();
	const navigate = useNavigate();
	const termCode = yearTerm?.slice(-2);
	const year = yearTerm?.slice(0, 4);

	// Parse the courseId parameter
	// Expected format: {subject}{number}{optional_suffix}-{section}
	// Example: CSC101-01
	// Parse courseId directly in state initialization
	const [courseParams, _] = useState<ExtendedCourse | null>(() => {
		if (!courseId) return null;

		const match = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/);
		if (!match) return null;

		return {
			subject: match[1],
			number: parseInt(match[2]),
			suffix: match[3] || "",
			title: "Title Not Available",
			course_section: match[4],
			creditHours: 0,
			studentCount: 0,
			totalCreditHours: 0,
			term: {
				code: termCode || "",
				description: "",
				year: parseInt(year || "0"),
				courseCount: 0,
				studentCount: 0,
				creditHoursDelivered: 0,
			},
		};
	});

	// Navigate back to term details
	const handleBackToTerm = () => {
		navigate(`/instructors/${mnumber}/term-history/${yearTerm}`);
	};

	return (
		<div className="w-full mx-auto p-6 space-y-6 ">
			<div className="flex flex-col">
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

			{courseParams &&
				<Roster
					mnumber={mnumber || ''}
					selectedCourse={courseParams}
				/>
			}
		</div>
	);
};