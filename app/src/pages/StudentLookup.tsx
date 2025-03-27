import { useState } from "react";
import StudentFilters from "@/components/student-filters";
import { FilterState } from "../components/student-filters";

interface Student {
	mnumber: string;
	first_name: string;
	last_name: string;
}

const StudentLookup = () => {
	const [results, setResults] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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

	return (
		<div className="p-6">
			<StudentFilters onApplyFilters={fetchStudents} />
			<div className="mt-6">
				<h2>Results</h2>
				{isLoading ? (
					<p>Loading...</p>
				) : results.length > 0 ? (
					<ul>
						{results.map((student) => (
							<li key={student.mnumber}>
								{student.first_name} {student.last_name} {student.mnumber}
							</li>
						))}
					</ul>
				) : (
					<p>No students found.</p>
				)}
			</div>
		</div>
	);
};

export default StudentLookup;