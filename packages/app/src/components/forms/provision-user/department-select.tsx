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
import type { Department } from "@cobis/types";

type MinimalDepartment =
	Omit<Department, "college">;

// GraphQL imports
import type { departmentSelectQuery } from "./__generated__/departmentSelectQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const departmentSelectQuery = graphql`
	query departmentSelectQuery {
		getDepartments {
			code
			description
		}
	}
`;

export const DepartmentSelect: React.FC<{
	onChange: (selectedDepartment: MinimalDepartment | null) => void;
}> = ({ onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<DepartmentSelectContent onChange={onChange} />
		</Suspense>
	);
};

const DepartmentSelectContent: React.FC<{
	onChange: (selectedDepartment: MinimalDepartment | null) => void;
}> = ({ onChange }) => {
	const [selectedDepartment, setSelectedDepartment] = useState<MinimalDepartment | null>(null);

	const data = useLazyLoadQuery<departmentSelectQuery>(
		departmentSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const departments = data.getDepartments;

	const handleDepartmentToggle = (department: MinimalDepartment) => {
		if (selectedDepartment?.code === department.code) {
			setSelectedDepartment(null);
			onChange(null);
		} else {
			setSelectedDepartment(department);
			onChange(department);
		}
	};

	return (
		<div className="w-full border rounded-md shadow-sm">
			<Command>
				<CommandList>
					{departments.length === 0 ? (
						<CommandEmpty>No departments found</CommandEmpty>
					) : (
						<CommandGroup>
							{departments.map((department) => (
								<CommandItem
									key={department.code}
									onSelect={() => handleDepartmentToggle(department)}
									className="cursor-pointer"
								>
									{department.description}
									{selectedDepartment?.code === department.code && (
										<CommandShortcut>✓</CommandShortcut>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</Command>
		</div>
	);
};