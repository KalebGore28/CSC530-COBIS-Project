import { useState, useEffect } from "react";
import axios from 'axios';
import { StudentFilters } from "@/components/student-filter";
import { FilterState } from "@/components/student-filter";
import { PaginatedTable } from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/modals/modal";
import { StudentDetail } from "@/components/student-detail";
import { format } from 'date-fns';

export interface Student {
	mnumber: string;
	firstName: string;
	lastName: string;
	email: string;
}

const makePreHeader = (filters: FilterState): string[] => {
	const lines: string[] = [];

	if (filters.academicLevels.length) {
		lines.push(`Academic Levels,${filters.academicLevels.join('|')}`);
	}
	if (filters.gpaRange) {
		lines.push(`GPA,${filters.gpaRange[0]}-${filters.gpaRange[1]}`);
	}

	// always add an export timestamp
	lines.push(`Exported At,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);

	return lines;
};

const StudentLookup = () => {
	const [results, setResults] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedName, setSelectedName] = useState<string>('');
	const [currentFilters, setCurrentFilters] = useState<FilterState>({
		academicLevels: [],
		gpaRange: [0, 4],
		programFilters: {},
		courseFilters: {},
	});

	useEffect(() => {
		console.log('Current Filters:', currentFilters);
	}, [currentFilters]);

	const fetchStudents = async (filters: FilterState) => {
		setIsLoading(true);
		try {
			// Build a plain object of params
			const params: Record<string, string> = {};

			if (filters.academicLevels.length) {
				params.academicLevels = filters.academicLevels.join(',');
			}
			if (filters.gpaRange) {
				params.gpaMin = filters.gpaRange[0].toString();
				params.gpaMax = filters.gpaRange[1].toString();
			}

			// Set current filters for preHeader
			setCurrentFilters(filters);

			// Axios GET with credentials included
			const response = await axios.get<Student[]>('/api/student-lookup', {
				params,
				withCredentials: true,
			});

			setResults(response.data);
		} catch (error) {
			console.error('Error fetching students:', error);
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
						<PaginatedTable<Student>
							isLoading={isLoading}
							className="border"
							data={results}
							columns={[
								{ key: "mnumber", label: "MNumber" },
								{ key: "firstName", label: "First Name" },
								{ key: "lastName", label: "Last Name" },
								{ key: 'email', label: 'Email', transform: val => val.toLowerCase() }
							]}
							rowsPerPage={10}
							fileName="student-lookup"
							preHeader={makePreHeader(currentFilters)}
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