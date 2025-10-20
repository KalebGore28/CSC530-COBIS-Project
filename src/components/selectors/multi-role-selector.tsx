import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command"
import { roles } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/provider/session";
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

interface MultiRoleSelectorProps {
    /**
     * The ID of the user being assigned roles
     * Used to prevent removing the "cobis_admin" role from oneself
    */
    userMnumber: string;
    roles?: string[];
    /** Called whenever the selected roles change */
    onRolesChange?: (selectedRoles: Role[]) => void;
}
export function MultiRoleSelector({ userMnumber, roles, onRolesChange }: MultiRoleSelectorProps) {
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const { session } = useSession();

    const { data, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => execute(rolesQuery),
    });

    const roleList = data?.roles || [];

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    // Initialize from props after data loads, but only if empty
    if (selectedRoles.length === 0 && roles && roleList.length > 0) {
        const mappedRoles = roleList.filter((r) => roles.includes(r.name));
        if (mappedRoles.length > 0) {
            setSelectedRoles(mappedRoles);
            queueMicrotask(() => onRolesChange?.(mappedRoles));
        }
    }

    return (
        <div className="w-full border rounded-md shadow-sm">
            <Command>
                <CommandList>
                    {roleList.length === 0 ? (
                        <CommandEmpty>No roles found</CommandEmpty>
                    ) : (
                        <CommandGroup>
                            {roleList.map((role) => {
                                const isSelected = selectedRoles.some((r) => r.id === role.id);
                                const isAdminRole = role.name === "cobis_administrator";
                                const isOwnAccount = userMnumber === session?.mnumber;
                                const isDisabled = isAdminRole && isOwnAccount;

                                return (
                                    <CommandItem
                                        key={role.id}
                                        disabled={isDisabled}
                                        onSelect={() => {
                                            if (isDisabled) return; // prevent changes
                                            let updatedRoles: Role[];

                                            if (isSelected) {
                                                updatedRoles = selectedRoles.filter((r) => r.id !== role.id);
                                            } else {
                                                updatedRoles = [...selectedRoles, role];
                                            }

                                            setSelectedRoles(updatedRoles);
                                            onRolesChange?.(updatedRoles);
                                        }}
                                        className={`flex items-center justify-between ${isDisabled ? "opacity-50 pointer-events-none" : ""
                                            }`}
                                    >
                                        {role.name}
                                        {isSelected && <CommandShortcut>✓</CommandShortcut>}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    );
}