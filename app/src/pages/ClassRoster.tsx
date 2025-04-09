import React, { useState, useEffect } from "react";
import { useSession } from "@/hooks/session-context";
import { TermSelector, Term } from "@/components/selectors/term-selector";
import { CourseSelector, Course } from "@/components/selectors/course-selector"
// Define interfaces for API response


// Modified ClassRoster component that will fetch data from API
const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(false);
	const [rosterError, setRosterError] = useState<string | null>(null);

	const handleTermSelect = (term: Term) => {
		setSelectedTerm(term);
		setSelectedCourse(null); // Reset course selection when term changes
	};

	const handleCourseSelect = (course: Course) => {
		setSelectedCourse(course);
		setRosterError(null); // Clear any previous errors
	};

	useEffect(() => {
		if (selectedCourse) {
			console.log("Selected course:", {
				courseId: selectedCourse.courseId,
				section: selectedCourse.courseSection,
				title: selectedCourse.courseTitle,
				crn: selectedCourse.crn,
				students: selectedCourse.studentCount,
				term: `${selectedCourse.termName} ${selectedCourse.year}`
			});
		}
	}, [selectedCourse]);


	return (
		<div className="p-6 max-w-7xl mx-auto">
			{session && <TermSelector
				mnumber={session.mnumber}
				onTermSelect={handleTermSelect}
			/>}

			{session && selectedTerm && <CourseSelector
				mnumber={session.mnumber}
				selectedTerm={selectedTerm}
				onCourseSelect={handleCourseSelect}
				onError={(_) => setRosterError("Failed to load courses. Please try again.")}
			/>}

			{session && selectedTerm && selectedCourse && console.log()}

		</div>
	);
};

export default ClassRosterPage;
