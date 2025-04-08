import React, { useState, useEffect } from "react";
import ClassRosterComponent from "@/components/class-roster";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
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


		</div>
	);
};

export default ClassRosterPage;
