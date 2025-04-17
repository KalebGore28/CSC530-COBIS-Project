import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"; // Assuming shadcn structure
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"; // Assuming shadcn structure
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming shadcn structure
import { Skeleton } from "@/components/ui/skeleton"; // Assuming shadcn structure
import { Terminal } from "lucide-react"; // Example icon for Alert

// Define the structure of a student based on the API response schema
// Matches the 'StudentSchema' from advisor-specs.ts
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

/**
 * Component to display students advised by the currently logged-in user.
 */
const AdvisedStudentsPage: React.FC = () => {
	// State for storing the list of students
	const [students, setStudents] = useState<Student[]>([]);
	// State to track loading status
	const [isLoading, setIsLoading] = useState<boolean>(true);
	// State to store any error messages
	const [error, setError] = useState<string | null>(null);

	// Effect hook to fetch data when the component mounts
	useEffect(() => {
		const fetchAdvisedStudents = async () => {
			setIsLoading(true); // Start loading
			setError(null); // Reset error state

			try {
				// Fetch data from the advisor API endpoint
				// Assumes authentication (e.g., Bearer token) is handled by the fetch call
				// or a wrapper function/interceptor.
				const response = await fetch('/api/advisor/students'); // Adjust URL if needed

				// Check if the request was successful
				if (!response.ok) {
					// Handle common HTTP errors
					if (response.status === 401) {
						throw new Error('Unauthorized: Please log in.');
					} else if (response.status === 403) {
						throw new Error('Forbidden: You do not have permission to view this page.');
					}
					// Try to parse error message from response body
					let errorData;
					try {
						errorData = await response.json();
					} catch (parseError) {
						// Ignore if response body is not JSON
					}
					throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
				}

				// Parse the JSON response
				const data: Student[] = await response.json();
				setStudents(data); // Update state with fetched students

			} catch (err) {
				// Handle errors during fetch or processing
				console.error("Error fetching advised students:", err);
				setError(err instanceof Error ? err.message : 'An unknown error occurred.');
			} finally {
				setIsLoading(false); // Stop loading regardless of success or error
			}
		};

		fetchAdvisedStudents(); // Call the fetch function
	}, []); // Empty dependency array means this effect runs once on mount

	// Helper function to render loading skeletons
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

	const handleStudentClick = (student: Student) => {
		console.log("Student clicked:", student);
		// TODO: Implement your modal opening logic here
		// Example: setSelectedStudent(student); setIsModalOpen(true);
	};

	// Render the component UI
	// Render the component UI
	return (
		<div className="container mx-auto p-4 md:p-6">
			<Card>
				<CardHeader>
					<CardTitle>My Advised Students</CardTitle>
					<CardDescription>
						List of students currently assigned to you as an advisor. Click on a row for more details.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Display error message if an error occurred */}
					{error && (
						<Alert variant="destructive" className="mb-4">
							<Terminal className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Display the table or loading skeletons */}
					<div className="rounded-md border"> {/* Added border for better table definition */}
						<Table>
							<TableHeader>
								<TableRow>
									{/* Adjusted padding for header */}
									<TableHead className="pl-4">M-Number</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Age</TableHead>
									<TableHead>Residency</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									renderSkeletons() // Show skeletons while loading
								) : students.length > 0 ? (
									// Map over the students array to create table rows
									students.map((student) => (
										// --- MODIFIED: Added onClick and styling to TableRow ---
										<TableRow
											key={student.mnumber}
											onClick={() => handleStudentClick(student)}
											className="cursor-pointer hover:bg-muted/50" // Make row clickable
										>
											{/* Adjusted padding for cells */}
											<TableCell className="font-medium pl-4">{student.mnumber}</TableCell>
											<TableCell>{`${student.lastName}, ${student.firstName}${student.middleName ? ' ' + student.middleName : ''}${student.suffix ? ' ' + student.suffix : ''}`}</TableCell>
											<TableCell>{student.email}</TableCell>
											<TableCell>{student.age}</TableCell>
											<TableCell>{student.residencyDescription}</TableCell>
										</TableRow>
									))
								) : (
									// Show message if no students are found (and not loading/error)
									<TableRow>
										<TableCell colSpan={5} className="text-center h-24"> {/* Added height for empty state */}
											No advised students found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* --- TODO: Add your Modal component here --- */}
			{/* Example: <StudentDetailModal isOpen={isModalOpen} student={selectedStudent} onClose={() => setIsModalOpen(false)} /> */}

		</div>
	);
};

export default AdvisedStudentsPage;