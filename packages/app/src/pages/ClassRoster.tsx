import React, { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { useSession } from "@/context/session";
import { TermSelector } from "@/components/selectors/term-selector";
import { CourseSelector } from "@/components/selectors/course-selector";
import { Roster } from "@/components/roster";


// Import types
import type { ExtendedTerm } from "@/components/selectors/term-selector";
import type { ExtendedCourse } from "@/components/selectors/course-selector";

export const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

	const handleTermSelect = (term: ExtendedTerm) => {
		setSelectedTerm(term);
		setSelectedCourse(null);
	};

	const handleCourseSelect = (course: ExtendedCourse) => {
		setSelectedCourse(course);
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
						<TermSelector
							mnumber={session.info.mnumber}
							onTermSelect={handleTermSelect}
						/>
						{/* Course Selector */}
						{selectedTerm && (
							<CourseSelector
								mnumber={session.info.mnumber}
								selectedTerm={selectedTerm}
								onCourseSelect={handleCourseSelect}
							/>
						)}
					</div>

					{session && selectedCourse && (
						<>
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