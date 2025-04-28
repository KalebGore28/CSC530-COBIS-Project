// src/pages/AdvisedStudentsPage.tsx (or wherever your page component is)

import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"; // Adjust path
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"; // Adjust path
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Adjust path
import { Skeleton } from "@/components/ui/skeleton"; // Adjust path
import { Terminal } from "lucide-react";

// --- Import the Modal and StudentDetail components ---
import { Modal } from "@/components/modals/modal";
import StudentDetail from '@/components/student-detail'; // Adjust path to your StudentDetail component

// Define the structure of a student
interface Student {
	mnumber: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffix: string | null;
	gender: string;
	birthdate: string;
	citizenship: string;
	raceCode: string;
	raceDescription: string;
	residencyCode: string;
	residencyDescription: string;
	age: number;
	cellPhone: string | null;
	email: string;
}

const AdvisedStudentsPage: React.FC = () => {
	const [students, setStudents] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// --- State for Modal Control ---
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedStudentName, setSelectedStudentName] = useState<string>(''); // For Modal title

	useEffect(() => {
		const fetchAdvisedStudents = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch('/api/advisor/me');
				if (!response.ok) {
					if (response.status === 401) throw new Error('Unauthorized: Please log in.');
					if (response.status === 403) throw new Error('Forbidden: You do not have permission.');
					let errorData;
					try { errorData = await response.json(); } catch { /* ignore */ }
					throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
				}
				const data: Student[] = await response.json();
				setStudents(data);
			} catch (err) {
				console.error("Error fetching advised students:", err);
				setError(err instanceof Error ? err.message : 'An unknown error occurred.');
			} finally {
				setIsLoading(false);
			}
		};
		fetchAdvisedStudents();
	}, []);

	const renderSkeletons = () => (
		Array.from({ length: 5 }).map((_, index) => (
			<TableRow key={`skeleton-${index}`}>
				<TableCell><Skeleton className="h-4 w-24" /></TableCell>
				<TableCell><Skeleton className="h-4 w-40" /></TableCell>
				<TableCell><Skeleton className="h-4 w-48" /></TableCell>
				<TableCell><Skeleton className="h-4 w-16" /></TableCell>
				<TableCell><Skeleton className="h-4 w-24" /></TableCell>
			</TableRow>
		))
	);

	// --- Updated Click Handler ---
	const handleStudentClick = (student: Student) => {
		console.log("Student clicked:", student.mnumber);
		setSelectedMnumber(student.mnumber);
		setSelectedStudentName(`${student.firstName} ${student.lastName}`); // Set name for title
		setIsModalOpen(true); // Open the modal
	};

	// --- Handler to Close Modal ---
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedMnumber(null); // Clear selection when closing
		setSelectedStudentName('');
	};

	return (
		<div className="container mx-auto p-4 md:p-6">
			<Card>
				<CardHeader>
					<CardTitle>My Advised Students</CardTitle>
					<CardDescription>
						List of students currently assigned to you. Click on a row for more details.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<Terminal className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="pl-4">M-Number</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Age</TableHead>
									<TableHead>Residency</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									renderSkeletons()
								) : students.length > 0 ? (
									students.map((student) => (
										<TableRow
											key={student.mnumber}
											onClick={() => handleStudentClick(student)} // Attach click handler
											className="cursor-pointer hover:bg-muted/50 transition-colors" // Add transition
										>
											<TableCell className="font-medium pl-4">{student.mnumber}</TableCell>
											<TableCell>{`${student.lastName}, ${student.firstName}${student.middleName ? ' ' + student.middleName : ''}${student.suffix ? ' ' + student.suffix : ''}`}</TableCell>
											<TableCell>{student.email}</TableCell>
											<TableCell>{student.age}</TableCell>
											<TableCell>{student.residencyDescription}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="text-center h-24">
											No advised students found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* --- Render the Modal --- */}
			{/* The Modal is rendered here but only visible when isModalOpen is true */}
			{/* It's important to conditionally render StudentDetail *inside* the modal */}
			{/* or pass selectedMnumber so it knows when to fetch */}
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={`Student Details - ${selectedStudentName}`} // Dynamic title
				description={`Showing comprehensive details for M-Number: ${selectedMnumber || 'N/A'}`}
				// Use the contentClassName prop for better sizing
				// Adjust these classes as needed for your desired modal width
				contentClassName="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl" // Example: Wider modal sizes
			>
				{/*
                  Render StudentDetail only when an mnumber is selected and modal is technically open.
                  Passing the 'key' prop ensures that if the modal somehow stays open but the
                  mnumber changes, the StudentDetail component will remount and fetch new data.
                */}
				{selectedMnumber && (
					<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
				)}
			</Modal>
		</div>
	);
};

export default AdvisedStudentsPage;