import { useState } from "react";
import SearchInput from "../components/search-input"; // Adjust the import path
import { Card, CardContent } from "@/components/ui/card";

// Define the Program interface
interface Program {
	code: string;
	description: string;
	cipCode?: string;
	isMajor?: boolean;
	isMinor?: boolean;
	hasConcentration?: boolean;
	isDiscontinued?: boolean;
	isAacsb?: boolean;
	department?: string;
	college?: string;
}

// Function to fetch programs from the API
const fetchPrograms = async (query: string): Promise<Program[]> => {
	try {
		const response = await fetch(`/api/search/programs?query=${encodeURIComponent(query)}`, {
			method: 'GET',
			credentials: 'include', // Include if authentication is required
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error('Failed to fetch programs');
		}
		const data: Program[] = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching programs:', error);
		return []; // Return empty array on error to avoid crashing
	}
};

const StudentLookup = () => {
	const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);

	// Add selected program if it's not already added
	const handleProgramSelect = (program: Program) => {
		if (!selectedPrograms.some((p) => p.code === program.code)) {
			setSelectedPrograms([...selectedPrograms, program]);
		}
	};

	// Remove program from the selected list
	const handleRemoveProgram = (programCode: string) => {
		setSelectedPrograms(selectedPrograms.filter((p) => p.code !== programCode));
	};

	return (
		<div className="p-5">
			<h1>Student Lookup</h1>

			{/* Search Component for Programs */}
			<div className="mt-4">
				<h3>Filter by Program</h3>
				<SearchInput<Program>
					searchApi={fetchPrograms}
					onSelect={handleProgramSelect}
					placeholder="Type to search programs..."
					debounceTime={300}
					renderResult={(program: Program) => `${program.code} - ${program.description}`}
				/>
			</div>

			{/* Selected Programs List */}
			{selectedPrograms.length > 0 && (
				<div className="mt-4">
					<h4>Selected Programs:</h4>
					<Card className="mt-2 p-2">
						<CardContent>
							<ul>
								{selectedPrograms.map((program) => (
									<li key={program.code} className="flex justify-between items-center p-2">
										{program.code} - {program.description} {program.department && `(${program.department})`}
										<button onClick={() => handleRemoveProgram(program.code)} className="text-red-500 ml-2">
											Remove
										</button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Simulated Student Results */}
			<div className="mt-4">
				<h4>Students Found:</h4>
				{selectedPrograms.length > 0 ? (
					<p>
						Showing students enrolled in:{" "}
						{selectedPrograms.map((p) => `${p.code}: ${p.description}`).join(", ")}
					</p>
				) : (
					<p>Please select at least one program to filter students.</p>
				)}
			</div>
		</div>
	);
};

export default StudentLookup;