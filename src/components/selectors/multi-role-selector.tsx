import { useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import type { roles } from '@/db/schema'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthentication } from '@/lib/auth-client'
import { rolesCollection } from '@/integrations/tanstack-db/roles'

type Role = typeof roles.$inferSelect

interface MultiRoleSelectorProps {
    /**
     * The ID of the user being assigned roles
     * Used to prevent removing the "cobis_admin" role from oneself
     */
    userMnumber: string
    userRoles?: Array<string>
    /** Called whenever the selected roles change */
    onRolesChange?: (selectedRoles: Array<Role>) => void
}
export function MultiRoleSelector({
    userMnumber,
    userRoles,
    onRolesChange,
}: MultiRoleSelectorProps) {
    const [selectedRoles, setSelectedRoles] = useState<Array<Role>>([])
    const { userSession } = useAuthentication()

    const { data: rolesList, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ roles: rolesCollection })
                .orderBy(({ roles }) => roles.name, 'asc'),
        [], // Run only once
    )

    if (isLoading) return <Skeleton className="h-40 w-full" />

    // Initialize from props after data loads, but only if empty
    if (selectedRoles.length === 0 && userRoles && rolesList.length > 0) {
        const mappedRoles = rolesList.filter((r) => userRoles.includes(r.name))
        if (mappedRoles.length > 0) {
            setSelectedRoles(mappedRoles)
            queueMicrotask(() => onRolesChange?.(mappedRoles))
        }
    }

    return (
        <div className="w-full rounded-md border shadow-sm">
            <Command>
                <CommandList>
                    {rolesList.length === 0 ? (
                        <CommandEmpty>No roles found</CommandEmpty>
                    ) : (
                        <CommandGroup>
                            {rolesList.map((role) => {
                                const isSelected = selectedRoles.some(
                                    (r) => r.id === role.id,
                                )
                                const isAdminRole =
                                    role.name === 'cobis_administrator'
                                const isOwnAccount =
                                    userMnumber === userSession?.user.mnumber
                                const isDisabled = isAdminRole && isOwnAccount

                                return (
                                    <CommandItem
                                        key={role.id}
                                        disabled={isDisabled}
                                        onSelect={() => {
                                            if (isDisabled) return // prevent changes
                                            let updatedRoles: Array<Role>

                                            if (isSelected) {
                                                updatedRoles =
                                                    selectedRoles.filter(
                                                        (r) => r.id !== role.id,
                                                    )
                                            } else {
                                                updatedRoles = [
                                                    ...selectedRoles,
                                                    role,
                                                ]
                                            }

                                            setSelectedRoles(updatedRoles)
                                            onRolesChange?.(updatedRoles)
                                        }}
                                        className={`flex items-center justify-between ${
                                            isDisabled
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }`}
                                    >
                                        {role.name}
                                        {isSelected && (
                                            <CommandShortcut>✓</CommandShortcut>
                                        )}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </div>
    )
}
