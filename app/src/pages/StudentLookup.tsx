// src/app/student-lookup/page.tsx  (or wherever your page lives)
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fetchGraphQL } from "@/utils/fetch-graphql";
import { toast } from "sonner";

import { StudentFilters } from "@/components/student-filter";
import { FilterState } from "@/components/student-filter";
import { PaginatedTable } from "@/components/common/paginated-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/modals/modal";
import { StudentDetail } from "@/components/student-detail";

//
// 1) GraphQL query string
//
const LOOKUP_STUDENTS_QUERY = `
  query LookupStudents($filters: StudentLookupInput!) {
    lookupStudents(filters: $filters) {
      mnumber
      firstName
      lastName
      email
    }
  }
`;

export interface Student {
	mnumber: string;
	firstName: string;
	lastName: string;
	email: string;
}

const makePreHeader = (filters: FilterState): string[] => {
	const lines: string[] = [];

	if (filters.academicLevels.length) {
		lines.push(`Academic Levels,${filters.academicLevels.join("|")}`);
	}
	if (filters.gpaRange) {
		lines.push(`GPA,${filters.gpaRange[0]}-${filters.gpaRange[1]}`);
	}

	if (Object.keys(filters.programFilters).length) {
		const programLines = Object.entries(filters.programFilters)
			.map(([program, flags]) => {
				const flagsStr = [];
				if (flags.is_major) flagsStr.push("major");
				if (flags.is_minor) flagsStr.push("minor");
				return `${program} (${flagsStr.join(",")})`;
			})
			.join("|");
		lines.push(`Programs,${programLines}`);
	}

	if (Object.keys(filters.courseFilters).length) {
		const courseLines = Object.entries(filters.courseFilters)
			.map(([course, cf]) => {
				const flagsStr = [];
				if (cf.taken) flagsStr.push("taken");
				if (cf.gradeOperator) flagsStr.push(`grade ${cf.gradeOperator}`);
				if (cf.grade) flagsStr.push(`grade ${cf.grade}`);
				return `${course} (${flagsStr.join(",")})`;
			})
			.join("|");
		lines.push(`Courses,${courseLines}`);
	}
	// always add an export timestamp
	lines.push(`Exported At,${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`);

	return lines;
};

const StudentLookup = () => {
	const [results, setResults] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedName, setSelectedName] = useState("");
	const [currentFilters, setCurrentFilters] = useState<FilterState>({
		academicLevels: [],
		gpaRange: [0, 4],
		programFilters: {},
		courseFilters: {},
	});

	useEffect(() => {
		console.log("Current filters:", currentFilters);
	},[currentFilters]);

	const fetchStudents = async (filters: FilterState) => {
		setIsLoading(true);
		try {
			// 2) Build your GraphQL variables from FilterState
			const gqlFilters: any = {};

			if (filters.academicLevels.length) {
				gqlFilters.academicLevels = filters.academicLevels;
			}
			// Only include GPA if user has narrowed the range off [0,4]
			if (!(filters.gpaRange[0] === 0 && filters.gpaRange[1] === 4)) {
				gqlFilters.gpaMin = filters.gpaRange[0];
				gqlFilters.gpaMax = filters.gpaRange[1];
			}

			// programs: Record<string, { is_major?, is_minor? }>
			const programEntries = Object.entries(filters.programFilters)
				.filter(([, flags]) => flags.is_major || flags.is_minor)
				.map(([program, flags]) => ({
					program,
					is_major: !!flags.is_major,
					is_minor: !!flags.is_minor,
				}));
			if (programEntries.length) {
				gqlFilters.programs = programEntries;
			}

			// courses: Record<string, { taken?, gradeOperator?, grade? }>
			const courseEntries = Object.entries(filters.courseFilters)
				.filter(([, cf]) => cf.taken !== undefined || cf.gradeOperator)
				.map(([course, cf]) => ({
					course,
					taken: cf.taken ?? false,
					operator: cf.gradeOperator,
					grade: cf.grade,
				}));
			if (courseEntries.length) {
				gqlFilters.courses = courseEntries;
			}

			// 3) Fire off GraphQL
			const data = await fetchGraphQL(
				LOOKUP_STUDENTS_QUERY,
				{ filters: gqlFilters }
			);
			if (data?.lookupStudents) {
				setResults(data.lookupStudents);
			} else {
				setResults([]);
			}

			// keep for CSV export
			setCurrentFilters(filters);
		} catch (err: any) {
			console.error("GraphQL error:", err);
			toast.error("Failed to fetch students");
		} finally {
			setIsLoading(false);
		}
	};

	const handleStudentClick = (s: Student) => {
		setSelectedMnumber(s.mnumber);
		setSelectedName(`${s.firstName} ${s.lastName}`);
		setIsModalOpen(true);
	};

	// if no results (and not loading) show filters + “no students found”
	if (!isLoading && results.length === 0) {
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
					setSelectedName("");
					setIsModalOpen(false);
				}}
			/>

			<div className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Student Results</CardTitle>
					</CardHeader>
					<CardContent className="p-4">
						<PaginatedTable<Student>
							isLoading={isLoading}
							className="border"
							data={results}
							columns={[
								{ key: "mnumber", label: "MNumber" },
								{ key: "firstName", label: "First Name" },
								{ key: "lastName", label: "Last Name" },
								{
									key: "email",
									label: "Email",
									transform: (val) => val.toLowerCase(),
								},
							]}
							rowsPerPage={10}
							fileName="student-lookup"
							preHeader={makePreHeader(currentFilters)}
							// onRowClick={handleStudentClick}
						/>
					</CardContent>

					<Modal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						title={`Student Detail: ${selectedName}`}
						size="5xl"
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
