import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { roles } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

type Role = typeof roles.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const rolesQuery = graphql(`
    query rolesQuery {
        roles {
            id
            name
        }
    }
`);

export function MultiRoleSelector() {
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    
    const { data, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => execute(rolesQuery),
    });

    const roles = data?.roles || [];

    if (isLoading) {
        return <Skeleton className="h-40 w-full" />;
    }

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
                                    onSelect={() => {
                                        const isSelected = selectedRoles.some(r => r.id === role.id);
                                        let updatedRoles: Role[];

                                        if (isSelected) {
                                            // Remove the role if it is already selected
                                            updatedRoles = selectedRoles.filter(r => r.id !== role.id);
                                        } else {
                                            // Add the role if it is not selected
                                            updatedRoles = [...selectedRoles, role];
                                        }

                                        setSelectedRoles(updatedRoles);
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    {role.name}
                                    {selectedRoles.some(selectedRole => selectedRole.id === role.id) && (
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