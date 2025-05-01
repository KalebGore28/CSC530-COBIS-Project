import { useState } from "react";
import axios from 'axios';
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
			// Build a plain object of params
			const params: Record<string, string> = {};

			if (filters.academicLevels.length) {
				params.academicLevels = filters.academicLevels.join(',');
			}
			if (filters.gpaRange) {
				params.gpaMin = filters.gpaRange[0].toString();
				params.gpaMax = filters.gpaRange[1].toString();
			}
			if (filters.majors.length) {
				params.majors = filters.majors.map(m => m.code).join(',');
			}
			if (filters.minors.length) {
				params.minors = filters.minors.map(m => m.code).join(',');
			}
			if (filters.coursesTaken.length) {
				params.coursesTaken = filters.coursesTaken
					.map(c => `${c.subject}${c.number}${c.suffix || ''}`)
					.join(',');
			}
			if (filters.coursesNotTaken.length) {
				params.coursesNotTaken = filters.coursesNotTaken
					.map(c => `${c.subject}${c.number}${c.suffix || ''}`)
					.join(',');
			}
			if (filters.gradeFilters.length) {
				const gf = filters.gradeFilters
					.filter(g => g.course && g.grade)
					.map(g => `${g.course!.subject}${g.course!.number}${g.course!.suffix || ''}:${g.grade}`);
				if (gf.length) params.gradeFilters = gf.join(',');
			}

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