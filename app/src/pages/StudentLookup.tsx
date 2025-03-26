import { useState } from 'react';
import SearchInput from '../components/search-input'; // Adjust the import path as needed

// Define the Program interface to match the API response
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

// Real API function to fetch programs
const searchProgramsApi = async (query: string): Promise<Program[]> => {
	try {
		const response = await fetch(`/api/search/programs?query=${encodeURIComponent(query)}`, {
			method: 'GET',
			credentials: 'include', // Include this if your API requires authentication
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
		return []; // Return empty array on error to prevent crashes
	}
};

const StudentLookup = () => {
	// State to hold selected programs, typed with the Program interface
	const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);

	// Handler for when a program is selected in SearchComponent
	const handleProgramSelect = (program: Program) => {
		// Avoid duplicates by checking program.code (not program.id, as 'id' isn’t in the interface)
		if (!selectedPrograms.some((p) => p.code === program.code)) {
			setSelectedPrograms([...selectedPrograms, program]);
		}
	};

	// Handler to remove a selected program
	const handleRemoveProgram = (programCode: string) => {
		setSelectedPrograms(selectedPrograms.filter((p) => p.code !== programCode));
	};

	return (
		<div style={{ padding: '20px' }}>
			<h1>Student Lookup</h1>

			{/* SearchComponent for selecting programs */}
			<div>
				<h3>Filter by Program</h3>
				<SearchInput
					searchApi={searchProgramsApi}
					onSelect={handleProgramSelect}
					renderResult={(program: Program) => `${program.code} - ${program.description}`}
				/>
			</div>

			{/* Display selected programs with more properties */}
			{selectedPrograms.length > 0 && (
				<div style={{ marginTop: '20px' }}>
					<h4>Selected Programs:</h4>
					<ul>
						{selectedPrograms.map((program) => (
							<li key={program.code}>
								{/* Use code and description, safely handle optional properties */}
								{program.code} - {program.description}{' '}
								{program.department && `(${program.department})`}
								<button
									onClick={() => handleRemoveProgram(program.code)}
									style={{ marginLeft: '10px', color: 'red' }}
								>
									Remove
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Simulated student results */}
			<div style={{ marginTop: '20px' }}>
				<h4>Students Found:</h4>
				{selectedPrograms.length > 0 ? (
					<p>
						Showing students enrolled in:{' '}
						{selectedPrograms.map((p) => `${p.code}: ${p.description}`).join(', ')}
					</p>
				) : (
					<p>Please select at least one program to filter students.</p>
				)}
			</div>
		</div>
	);
};

export default StudentLookup;