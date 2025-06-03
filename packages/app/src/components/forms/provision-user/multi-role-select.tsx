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
	defaultRoles?: string[];
	onChange: (selectedRoles: string[]) => void;
}> = ({ onChange, defaultRoles }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<MultiRoleSelectContent onChange={onChange} defaultRoles={defaultRoles} />
		</Suspense>
	);
}

const MultiRoleSelectContent: React.FC<{
	defaultRoles?: string[];
	onChange: (selectedRoles: string[]) => void;
}> = ({ onChange, defaultRoles }) => {
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

	const data = useLazyLoadQuery<multiRoleSelectQuery>(
		multiRoleSelectQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const roles = data.getRoles;

	// Initialize selected roles from defaultRoles if provided
	if (
		defaultRoles &&
		defaultRoles.length > 0 &&
		selectedRoles.length === 0 &&
		roles.length > 0
	) {
		// filter by name, then map to IDs
		const initialIds = roles
			.filter((role) => defaultRoles.includes(role.name))
			.map((role) => role.id);

		if (initialIds.length > 0) {
			setSelectedRoles(initialIds);
			onChange(initialIds);
		}
	}

	const handleRoleToggle = (roleId: string) => {
		setSelectedRoles((prev) =>
			prev.includes(roleId)
				? prev.filter((id) => id !== roleId)
				: [...prev, roleId],
		);
		onChange(selectedRoles);
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
									{selectedRoles.includes(role.id) && (
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