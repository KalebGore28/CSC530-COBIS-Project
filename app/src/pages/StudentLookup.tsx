import { useState } from "react";
import { StudentFilters } from "@/components/student-filters";
import { FilterState } from "@/components/student-filters";
import { PaginatedTable } from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/modals/modal";
import { StudentDetail } from "@/components/student-detail";

export interface Student {
	mnumber: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	suffix?: string;
	email: string;
	age: number;
	gender: string;
}

const StudentLookup = () => {
	const [results, setResults] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedName, setSelectedName] = useState<string>('');

	const fetchStudents = async (filters: FilterState) => {
		setIsLoading(true);
		try {
			// Convert filters to query parameters
			const queryParams = new URLSearchParams();

			// Academic levels
			if (filters.academicLevels.length > 0) {
				queryParams.append('academicLevels', filters.academicLevels.join(','));
			}

			// GPA range
			if (filters.gpaRange) {
				queryParams.append('gpaMin', filters.gpaRange[0].toString());
				queryParams.append('gpaMax', filters.gpaRange[1].toString());
			}

			// Majors
			if (filters.majors.length > 0) {
				const majorCodes = filters.majors.map(major => major.code);
				queryParams.append('majors', majorCodes.join(','));
			}

			// Minors
			if (filters.minors.length > 0) {
				const minorCodes = filters.minors.map(minor => minor.code);
				queryParams.append('minors', minorCodes.join(','));
			}

			// Courses taken
			if (filters.coursesTaken.length > 0) {
				const coursesTakenIds = filters.coursesTaken.map(course => `${course.subject}${course.number}${course.suffix || ''}`);
				queryParams.append('coursesTaken', coursesTakenIds.join(','));
			}

			// Courses not taken
			if (filters.coursesNotTaken.length > 0) {
				const coursesNotTakenIds = filters.coursesNotTaken.map(course => `${course.subject}${course.number}${course.suffix || ''}`);
				queryParams.append('coursesNotTaken', coursesNotTakenIds.join(','));
			}

			// Grade filters
			if (filters.gradeFilters.length > 0) {
				const gradeFilterStrings = filters.gradeFilters
					.filter(filter => filter.course && filter.grade)
					.map(filter => `${filter.course!.subject}${filter.course!.number}${filter.course!.suffix || ''}:${filter.grade}`);
				if (gradeFilterStrings.length > 0) {
					queryParams.append('gradeFilters', gradeFilterStrings.join(','));
				}
			}

			// Make GET request with query parameters
			const response = await fetch(`/api/student-lookup?${queryParams.toString()}`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch students");
			}
			const data: Student[] = await response.json();
			setResults(data);
		} catch (error) {
			console.error("Error fetching students:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleStudentClick = (s: Student) => {
		setSelectedMnumber(s.mnumber);
		setSelectedName(`${s.firstName} ${s.lastName}`);
		setIsModalOpen(true);
	};

	// If no results are found, show a message
	if (results.length <= 0) {
		return (
			<div className="p-6">
				<StudentFilters onApplyFilters={fetchStudents} />
				<div className="mt-6">
					<p>No students found.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<StudentFilters
				onApplyFilters={fetchStudents}
				onResetFilters={() => {
					setResults([]);
					setSelectedMnumber(null);
					setSelectedName('');
					setIsModalOpen(false);
				}}

			/>
			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Student Results</CardTitle>
					</CardHeader>
					<CardContent className="p-4"> {/* Add padding here */}
						<PaginatedTable
							isLoading={isLoading}
							className="border"
							data={results}
							columns={[
								{ key: "mnumber", label: "MNumber" },
								{ key: "firstName", label: "First Name" },
								{ key: "lastName", label: "Last Name" },
								{ key: "email", label: "Email" },
							]}
							rowsPerPage={10}
							onRowClick={handleStudentClick}
						/>
					</CardContent>

					<Modal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						title={`Student Detail: ${selectedName}`}
						size='5xl'
					>
						{selectedMnumber && (
							<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
						)}
					</Modal>
				</Card>
			</div>
		</div>
	);
};

export default StudentLookup;