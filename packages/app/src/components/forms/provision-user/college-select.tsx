import { Suspense, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandShortcut,
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
	onChange: (selectedCollege: College | null) => void;
}> = ({ onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<CollegeSelectContent onChange={onChange} />
		</Suspense>
	);
};

const CollegeSelectContent: React.FC<{
	onChange: (selectedColleges: College | null) => void;
}> = ({ onChange }) => {
	const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

	const data = useLazyLoadQuery<collegeSelectQuery>(
		collegeSelectQuery,
		{},
	);

	const colleges = data.getColleges;

	const handleCollegeToggle = (college: College) => {
		if (selectedCollege?.code === college.code) {
			setSelectedCollege(null);
			onChange(null);
		} else {
			setSelectedCollege(college);
			onChange(college);
		}
	};

	return (
		<div className="w-full border rounded-md shadow-sm">
			<Command>
				<CommandList>
					{colleges.length === 0 ? (
						<CommandEmpty>No colleges found</CommandEmpty>
					) : (
						<CommandGroup>
							{colleges.map((college) => (
								<CommandItem
									key={college.code}
									onSelect={() => handleCollegeToggle(college)}
								>
									{college.description}
									<CommandShortcut>
										{selectedCollege?.code === college.code
											&& "✓"}
									</CommandShortcut>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</Command>
		</div>
	);
};