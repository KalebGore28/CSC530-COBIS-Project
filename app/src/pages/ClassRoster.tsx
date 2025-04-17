import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/context/session";
import { TermSelector, Term } from "@/components/selectors/term-selector";
import { CourseSelector, Course } from "@/components/selectors/course-selector";
import ClassRosterComponent, { Student } from "@/components/features/roster/roster"; // Assuming Student type is exported here
import { Separator } from "@/components/ui/separator";

// --- Import the Modal and StudentDetail components ---
// Make sure this path is correct for your project structure
import { Modal } from "@/components/modals/modal";
// Make sure this path is correct for your project structure
import StudentDetail from '@/components/student-detail';

const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [error, setError] = useState<string | null>(null);

	// --- Modal State ---
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	// Store only the mnumber when a student is selected for the modal
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedStudentName, setSelectedStudentName] = useState<string>(''); // For Modal title

	useEffect(() => {
		if (selectedCourse) {
			console.log("Selected course:", { /* ... course details ... */ });
		}
	}, [selectedCourse]);

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

	// --- Modal Handlers ---
	/**
	 * Called when a student is selected from the ClassRosterComponent.
	 * Sets the state to open the modal with the selected student's details.
	 * @param student The student object selected.
	 */
	const handleStudentSelectForModal = (student: Student) => {
		if (!student || !student.mnumber) {
			console.error("Invalid student data received:", student);
			setError("Could not open details for the selected student.");
			return;
		}
		console.log(`Opening details for student: ${student.firstName} ${student.lastName} (${student.mnumber})`);
		setSelectedMnumber(student.mnumber);
		// Set the name for the modal title (optional, adjust formatting as needed)
		setSelectedStudentName(`${student.firstName} ${student.lastName}`);
		setIsModalOpen(true); // Open the modal
	};

	/**
	 * Closes the student detail modal and clears the selection state.
	 */
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedMnumber(null);
		setSelectedStudentName('');
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
							<ClassRosterComponent
								mnumber={session.info.mnumber}
								selectedCourse={selectedCourse}
								// Connect the component's output to our modal handler
								onStudentSelect={handleStudentSelectForModal}
							/>
						</>
					)}

					{/* --- Student Detail Modal --- */}
					{/* Render the modal conditionally based on isModalOpen */}
					<Modal
						isOpen={isModalOpen}
						onClose={handleCloseModal}
						title={`Student Details - ${selectedStudentName}`}
						description={`Showing comprehensive details for M-Number: ${selectedMnumber || 'N/A'}`}
						// Adjust width as needed using Tailwind classes
						contentClassName="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
					>
						{/*
                          Render StudentDetail only when an mnumber is selected.
                          The key prop ensures re-fetching if the mnumber changes
                          while the modal is somehow kept open.
                        */}
						{selectedMnumber && (
							<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
						)}
					</Modal>
				</>
			)}
		</div>
	);
};

export default ClassRosterPage;