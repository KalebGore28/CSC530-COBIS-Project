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
import { Role } from "@cobis/types";

const multiRoleSelectQuery = graphql`
	query multiRoleSelectQuery {
		getRoles {
			id
			name
		}
	}
`;

export const MultiRoleSelect: React.FC<{
	selectedRoles: Role[];
	onChange: (selectedRoles: Role[]) => void;
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
	selectedRoles: Role[];
	onChange: (selectedRoles: Role[]) => void;
}> = ({ selectedRoles, onChange }) => {
	console.log("MultiRoleSelectContent rendered with selectedRoles:", selectedRoles);

	const data = useLazyLoadQuery<multiRoleSelectQuery>(
		multiRoleSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const roles = data.getRoles;

	const handleRoleToggle = (roleId: string) => {
		console.log("Toggling role:", roleId);
		const isSelected = selectedRoles.some(role => role.id === parseInt(roleId));
		let updatedRoles: Role[];

		if (isSelected) {
			// Remove the role if it is already selected
			updatedRoles = selectedRoles.filter(role => role.id !== parseInt(roleId));
		} else {
			// Add the role if it is not selected
			const newRole = roles.find(role => role.id === roleId);
			if (newRole) {
				updatedRoles = [...selectedRoles, { ...newRole, id: parseInt(newRole.id) }];
			} else {
				return; // If the role is not found, do nothing
			}
		}

		onChange(updatedRoles);
		console.log("Updated roles:", updatedRoles);
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
									onSelect={() => handleRoleToggle(role.id)}
									className="flex items-center justify-between"
								>
									{role.name}
									{selectedRoles.some(selectedRole => selectedRole.id === parseInt(role.id)) && (
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