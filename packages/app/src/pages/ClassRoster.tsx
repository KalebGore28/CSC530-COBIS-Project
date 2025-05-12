import React, { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { useSession } from "@/context/session";
import { TermSelector, Term } from "@/components/selectors/term-selector";
import { CourseSelector, Course } from "@/components/selectors/course-selector";
import Roster from "@/components/roster"; // Assuming Student type is exported here
import { Separator } from "@/components/ui/separator";

const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleTermSelect = (term: Term) => {
		setSelectedTerm(term);
		setSelectedCourse(null);
	};

	const handleCourseSelect = (course: Course) => {
		setSelectedCourse(course);
		setError(null);
	};

	const handleError = (err: any) => {
		console.error("Error:", err);
		setError("Failed to load data. Please try again.");
	};



	return (
		<div className="container p-6 mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Class Roster</h1>

			{!session ? (
				<Alert variant="destructive">{/* ... Auth Error ... */}</Alert>
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
						{/* Course Selector */}
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
						<Alert variant="destructive">{/* ... Error Display ... */}</Alert>
					)}

					{/* Class Roster Component */}
					{session && selectedCourse && (
						<>
							<Separator className="my-6" />
							{/* Pass the modal opening handler to the ClassRosterComponent */}
							<Roster
								mnumber={session.info.mnumber}
								selectedCourse={selectedCourse}
							/>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default ClassRosterPage;