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
	onChange: (selectedRoles: string[]) => void;
}> = ({ onChange }) => {
	return (
		<Suspense fallback={<Skeleton className="h-40 w-full" />}>
			<MultiRoleSelectContent onChange={onChange} />
		</Suspense>
	);
}

const MultiRoleSelectContent: React.FC<{
	onChange: (selectedRoles: string[]) => void;
}> = ({ onChange }) => {
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

	const data = useLazyLoadQuery<multiRoleSelectQuery>(
		multiRoleSelectQuery,
		{},
	);

	const roles = data.getRoles;

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