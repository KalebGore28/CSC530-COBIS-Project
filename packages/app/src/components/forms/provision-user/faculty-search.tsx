import { Suspense, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton";
import type { Faculty } from "@cobis/types";

type MinimalFaculty = Omit<Faculty, "department" | "college">;

// GraphQL imports
import type { facultySearchQuery } from "./__generated__/facultySearchQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

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
	const [selectedFaculty, setSelectedFaculty] = useState<MinimalFaculty | null>(null);

	const data = useLazyLoadQuery<facultySearchQuery>(
		facultySearchQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
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

	return (
		<div className="w-full border rounded-md shadow-sm">
			<Command>
				<CommandList>
					{selectedFaculty ? (
						<CommandItem
							onSelect={() => handleFacultyToggle(selectedFaculty)}
							className="flex justify-between cursor-pointer"
						>
							<span>{`${selectedFaculty.first_name} ${selectedFaculty.last_name}`}</span>
							<span className="text-muted-foreground">✕</span>
						</CommandItem>
					) : (
						<>
							<CommandInput placeholder="Search faculty by name or MNumber..." />
							<CommandGroup heading="Faculty">
								{facultyList.length > 0 ? (
									facultyList.map((faculty) => (
										<CommandItem
											key={faculty.mnumber}
											onSelect={() => handleFacultyToggle(faculty)}
										>
											{`${faculty.first_name} ${faculty.last_name}`}
											<CommandShortcut>{faculty.mnumber}</CommandShortcut>
										</CommandItem>
									))
								) : (
									<CommandEmpty>No faculty found</CommandEmpty>
								)}
							</CommandGroup>
						</>
					)}
				</CommandList>
			</Command>
		</div>
	);
};
