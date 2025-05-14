import React, { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { useSession } from "@/context/session";
import { TermSelector } from "@/components/selectors/term-selector";
import { CourseSelector } from "@/components/selectors/course-selector";
import Roster from "@/components/roster";
import { Separator } from "@/components/ui/separator";

//temp
import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";

// Import types
import type { ExtendedTerm } from "@/components/selectors/term-selector";
import type { ExtendedCourse } from "@/components/selectors/course-selector";

const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleTermSelect = (term: ExtendedTerm) => {
		setSelectedTerm(term);
		setSelectedCourse(null);
	};

	const handleCourseSelect = (course: ExtendedCourse) => {
		setSelectedCourse(course);
		setError(null);
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
							/>
						</div>
						{/* Course Selector */}
						<div>
							{selectedTerm && (
								<CourseSelector
									mnumber={session.info.mnumber}
									selectedTerm={selectedTerm}
									onCourseSelect={handleCourseSelect}
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Pass the modal opening handler to the ClassRosterComponent */}
								{/* <Roster
								mnumber={session.info.mnumber}
								selectedCourse={selectedCourse}
							/> */}
								<RosterInfoCard course={selectedCourse} className="col-span-2" />
								<RosterGradeDistributions
									gradesData={{
										final_grades: [
											{ grade: "A", count: 10 },
											{ grade: "B", count: 5 },
											{ grade: "C", count: 3 },
											{ grade: "D", count: 2 },
											{ grade: "E", count: 1 },
											{ grade: "N/A", count: 0 },
										],
										midterm_grades: [
											{ grade: "A", count: 8 },
											{ grade: "B", count: 6 },
											{ grade: "C", count: 4 },
											{ grade: "D", count: 1 },
											{ grade: "E", count: 0 },
											{ grade: "N/A", count: 0 },
										],
									}}
								/>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default ClassRosterPage;