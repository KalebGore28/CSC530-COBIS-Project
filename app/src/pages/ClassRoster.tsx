import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/hooks/session-context";
import { TermSelector, Term } from "@/components/selectors/term-selector";
import { CourseSelector, Course } from "@/components/selectors/course-selector";
import ClassRosterComponent, { Student } from "@/components/roster";
import { Separator } from "@/components/ui/separator";

// Modified ClassRoster component that will fetch data from API
const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Log selected course whenever it changes
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

	const handleTermSelect = (term: Term) => {
		setSelectedTerm(term);
		setSelectedCourse(null); // Reset course selection when term changes
	};

	const handleCourseSelect = (course: Course) => {
		setSelectedCourse(course);
		setError(null); // Clear any previous errors
	};

	const handleError = (err: any) => {
		console.error("Error:", err);
		setError("Failed to load data. Please try again.");
	};

	return (
		<div className="container p-6 mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Class Roster</h1>

			{!session ? (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Authentication Error</AlertTitle>
					<AlertDescription>
						You must be logged in to view class rosters.
					</AlertDescription>
				</Alert>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Term Selector */}
						<div>
							<TermSelector
								mnumber={session.info.mnumber}
								onTermSelect={handleTermSelect}
								onError={handleError}
							/>
						</div>

						{/* Course Selector - only shown when a term is selected */}
						<div>
							{selectedTerm && (
								<CourseSelector
									mnumber={session.info.mnumber}
									selectedTerm={selectedTerm}
									onCourseSelect={handleCourseSelect}
									onError={handleError}
								/>
							)}
						</div>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Class Roster Component - only shown when a course is selected */}
					{session && selectedCourse && (
						<>
							<Separator className="my-6" />

							<ClassRosterComponent
								mnumber={session.info.mnumber}
								selectedCourse={selectedCourse}
								onStudentSelect={(student: Student) => {
									// Navigate to student page, open modal, etc.
									console.log(`Selected student: ${student.firstName} ${student.lastName} (${student.mnumber})`);
									// Example: router.push(`/student/${student.mnumber}`);
								}}
							/>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default ClassRosterPage;