import { Suspense, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandItem,
	CommandList,
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
	defaultCode?: string | null;
	onChange: (selectedDepartment: MinimalDepartment | null) => void;
}> = ({ onChange, defaultCode }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<DepartmentSelectContent onChange={onChange} defaultCode={defaultCode} />
		</Suspense>
	);
};

const DepartmentSelectContent: React.FC<{
	defaultCode?: string | null;
	onChange: (selectedDepartment: MinimalDepartment | null) => void;
}> = ({ onChange, defaultCode }) => {
	const [selectedDepartment, setSelectedDepartment] = useState<MinimalDepartment | null>(null);

	const data = useLazyLoadQuery<departmentSelectQuery>(
		departmentSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const departments = data.getDepartments;

	// Initialize selected department from defaultCode if provided
	if (defaultCode && !selectedDepartment) {
		const initialDepartment = departments.find(
			(d) => d.code.toLowerCase() === defaultCode.toLowerCase()
		);
		if (initialDepartment) {
			setSelectedDepartment(initialDepartment);
			onChange(initialDepartment);
		}
	}

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
					{selectedDepartment ? (
						<CommandItem
							onSelect={() => handleDepartmentToggle(selectedDepartment)}
							className="flex justify-between cursor-pointer"
						>
							<span>{selectedDepartment.description}</span>
							<span className="text-muted-foreground">✕</span>
						</CommandItem>
					) : departments.length === 0 ? (
						<CommandEmpty>No departments found</CommandEmpty>
					) : (
						departments.map((department) => (
							<CommandItem
								key={department.code}
								onSelect={() => handleDepartmentToggle(department)}
								className="cursor-pointer"
							>
								{department.description}
							</CommandItem>
						))
					)}
				</CommandList>
			</Command>
		</div>
	);
};
