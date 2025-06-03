import { Suspense } from "react";
import {
	Command,
	CommandEmpty,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton";
import type { College } from "@cobis/types";

// GraphQL imports
import type { collegeSelectQuery } from "./__generated__/collegeSelectQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const collegeSelectQuery = graphql`
	query collegeSelectQuery {
		getColleges {
			code
			description
		}
	}
`;

export const CollegeSelect: React.FC<{
	selectedCollege: College | null;
	onChange: (selectedCollege: College | null) => void;
}> = ({ selectedCollege, onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<CollegeSelectContent
				selectedCollege={selectedCollege}
				onChange={onChange}
			/>
		</Suspense>
	);
};

const CollegeSelectContent: React.FC<{
	selectedCollege: College | null;
	onChange: (selectedCollege: College | null) => void;
}> = ({ selectedCollege, onChange }) => {

	const data = useLazyLoadQuery<collegeSelectQuery>(
		collegeSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const colleges = data.getColleges;

	const handleCollegeToggle = (college: College) => {
		if (selectedCollege?.code === college.code) {
			onChange(null);
		} else {
			onChange(college);
		}
	};

	return (
		<div className="w-full border rounded-md shadow-sm">
			<Command>
				<CommandList>
					{selectedCollege ? (
						<CommandItem
							onSelect={() => handleCollegeToggle(selectedCollege)}
							className="flex justify-between cursor-pointer"
						>
							<span>{selectedCollege.description}</span>
							<span className="text-muted-foreground">✕</span>
						</CommandItem>
					) : colleges.length === 0 ? (
						<CommandEmpty>No colleges found</CommandEmpty>
					) : (
						colleges.map((college) => (
							<CommandItem
								key={college.code}
								onSelect={() => handleCollegeToggle(college)}
								className="cursor-pointer"
							>
								{college.description}
							</CommandItem>
						))
					)}
				</CommandList>
			</Command>
		</div>
	);
};
