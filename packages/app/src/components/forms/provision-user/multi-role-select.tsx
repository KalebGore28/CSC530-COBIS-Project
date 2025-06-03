import { Suspense } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton";

// GraphQL imports
import type { multiRoleSelectQuery } from "./__generated__/multiRoleSelectQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const multiRoleSelectQuery = graphql`
	query multiRoleSelectQuery {
		getRoles {
			id
			name
		}
	}
`;

export const MultiRoleSelect: React.FC<{
	selectedRoles: string[];
	onChange: (selectedRoles: string[]) => void;
}> = ({ selectedRoles, onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<MultiRoleSelectContent
				onChange={onChange}
				selectedRoles={selectedRoles}
			/>
		</Suspense>
	);
}

const MultiRoleSelectContent: React.FC<{
	selectedRoles: string[];
	onChange: (selectedRoles: string[]) => void;
}> = ({ selectedRoles, onChange }) => {

	const data = useLazyLoadQuery<multiRoleSelectQuery>(
		multiRoleSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const roles = data.getRoles;

	const handleRoleToggle = (roleName: string) => {
		const newSelected = selectedRoles.includes(roleName)
			? selectedRoles.filter((name) => name !== roleName)
			: [...selectedRoles, roleName];

		onChange(newSelected);
	};

	return (
		<div className="w-full border rounded-md shadow-sm">
			<Command>
				<CommandList>
					{roles.length === 0 ? (
						<CommandEmpty>No roles found</CommandEmpty>
					) : (
						<CommandGroup>
							{roles.map((role) => (
								<CommandItem
									key={role.id}
									onSelect={() => handleRoleToggle(role.name)}
									className="flex items-center justify-between"
								>
									{role.name}
									{selectedRoles.includes(role.name) && (
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
}