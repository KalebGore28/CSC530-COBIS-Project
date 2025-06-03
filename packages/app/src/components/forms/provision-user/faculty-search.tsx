import { Suspense, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandGroup,
	CommandShortcut,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import type { Faculty } from "@cobis/types";
import type { facultySearchQuery } from "./__generated__/facultySearchQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

type MinimalFaculty = Omit<Faculty, "department" | "college">;

const facultySearchQuery = graphql`
  query facultySearchQuery {
    faculty {
      first_name
      last_name
      mnumber
    }
  }
`;

export const FacultySearch: React.FC<{
	onChange: (selectedFaculty: MinimalFaculty | null) => void;
}> = ({ onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<FacultySearchContent onChange={onChange} />
		</Suspense>
	);
};

const FacultySearchContent: React.FC<{
	onChange: (selectedFaculty: MinimalFaculty | null) => void;
}> = ({ onChange }) => {
	const [selectedFaculty, setSelectedFaculty] = useState<MinimalFaculty | null>(
		null
	);
	const [searchTerm, setSearchTerm] = useState("");

	const data = useLazyLoadQuery<facultySearchQuery>(
		facultySearchQuery,
		{},
		{ fetchPolicy: "store-or-network" }
	);
	const facultyList = data.faculty;

	const handleFacultyToggle = (faculty: MinimalFaculty) => {
		if (
			selectedFaculty?.mnumber === faculty.mnumber &&
			selectedFaculty?.first_name === faculty.first_name &&
			selectedFaculty?.last_name === faculty.last_name
		) {
			setSelectedFaculty(null);
			onChange(null);
		} else {
			setSelectedFaculty(faculty);
			onChange(faculty);
		}
	};

	// case‐insensitive filter on name or mnumber
	const filtered = facultyList.filter((f) => {
		const fullName = `${f.first_name} ${f.last_name}`.toLowerCase();
		return (
			fullName.includes(searchTerm.toLowerCase()) ||
			f.mnumber.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	const handleAddCustom = () => {
		const trimmed = searchTerm.trim();
		if (!trimmed) return;
		const newFaculty: MinimalFaculty = {
			mnumber: trimmed,
			first_name: "New",
			last_name: "User",
		};
		setSelectedFaculty(newFaculty);
		onChange(newFaculty);
	};

	return (
		<div className="w-full border rounded-md shadow-sm">
			{selectedFaculty ? (
				// Collapsed view: use a regular div with padding to keep height
				<div
					className="flex justify-between items-center text-sm px-2 py-1.5 cursor-pointer"
					onClick={() => handleFacultyToggle(selectedFaculty)}
				>
					<span>{`${selectedFaculty.first_name} ${selectedFaculty.last_name} - (${selectedFaculty.mnumber})`}</span>
					<span className="text-muted-foreground">✕</span>
				</div>
			) : (
				// Expanded view: full Command search + list or “Add …” fallback
				<Command>
					<CommandList>
						<CommandInput
							placeholder="Search faculty by name or MNumber..."
							value={searchTerm}
							onValueChange={setSearchTerm}
						/>

						{filtered.length > 0 ? (
							<CommandGroup heading="Faculty">
								{filtered.map((faculty) => (
									<CommandItem
										key={faculty.mnumber}
										onSelect={() => handleFacultyToggle(faculty)}
										className="cursor-pointer"
									>
										{`${faculty.first_name} ${faculty.last_name}`}
										<CommandShortcut>{faculty.mnumber}</CommandShortcut>
									</CommandItem>
								))}
							</CommandGroup>
						) : (
							<>
								<CommandEmpty>No faculty found</CommandEmpty>
								{searchTerm.trim() !== "" && (
									<CommandItem
										// force-match on the raw input so Cmdk doesn’t filter it out
										value={searchTerm}
										onSelect={handleAddCustom}
										className="cursor-pointer"
									>
										➕ Add "{searchTerm.trim()}" as new user
									</CommandItem>
								)}
							</>
						)}
					</CommandList>
				</Command>
			)}
		</div>
	);
};
