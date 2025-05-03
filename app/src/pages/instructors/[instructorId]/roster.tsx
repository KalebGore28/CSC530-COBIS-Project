import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course } from "@/components/selectors/course-selector";
import { Roster } from "@/components/roster";
import { toast } from "sonner";
import Modal from "@/components/modals/modal";
import StudentDetail from "@/components/student-detail";


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
	// --- Modal State ---
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	// Store only the mnumber when a student is selected for the modal
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedStudentName, setSelectedStudentName] = useState<string>(''); // For Modal title


	// Parse courseId on component mount
	useEffect(() => {
		if (courseId) {
			const match = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/);

			if (match) {
				// @ts-ignore
				setCourseParams({
					courseSubject: match[1],
					courseNumber: parseInt(match[2]),
					courseSuffix: match[3] || '',
					courseSection: match[4],
					termCode: termCode || '',
					year: parseInt(year || '0'),
				});
			}
		}
	}, [courseId]);

	// Navigate back to term details
	const handleBackToTerm = () => {
		navigate(`/instructors/${mnumber}/${yearTerm}`);
	};

	// --- Modal Handlers ---
	/**
	 * Called when a student is selected from the ClassRosterComponent.
	 * Sets the state to open the modal with the selected student's details.
	 * @param student The student object selected.
	 */
	const handleStudentSelectForModal = (student: Student) => {
		if (!student || !student.mnumber) {
			toast.error("Invalid student data received");
			return;
		}
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

			{courseParams &&
				<Roster
					mnumber={mnumber || ''}
					selectedCourse={courseParams}
					onStudentSelect={handleStudentSelectForModal}
				/>
			}

			{/* --- Student Detail Modal --- */}
			{/* Render the modal conditionally based on isModalOpen */}
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={`Student Details - ${selectedStudentName}`}
				description={`Showing comprehensive details for M-Number: ${selectedMnumber || 'N/A'}`}
				size="5xl"
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
		</div>
	);
};

export default CourseRosterPage;