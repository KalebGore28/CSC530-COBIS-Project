import { useState } from 'react'
import { toast } from 'sonner'
import { eq, useLiveQuery } from '@tanstack/react-db'
import type { colleges, departments, faculty, roles, user } from '@/db/schema'
import { CollegeSelector } from '@/components/selectors/college-selector'
import { DepartmentSelector } from '@/components/selectors/department-selector'
import { FacultySelector } from '@/components/selectors/faculty-selector'
import { MultiRoleSelector } from '@/components/selectors/multi-role-selector'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useProvisionUser } from '@/hooks/use-provision-user'
import { useAuthentication } from '@/lib/auth-client'

import { usersCollection } from '@/integrations/tanstack-db/users'
import { userRolesCollection } from '@/integrations/tanstack-db/user-roles'
import { rolesCollection } from '@/integrations/tanstack-db/roles'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

type Role = typeof roles.$inferSelect
type Department = typeof departments.$inferSelect
type College = typeof colleges.$inferSelect
type Faculty = typeof faculty.$inferSelect
type User = typeof user.$inferSelect

export type ProvisionState = {
    roles: Array<Role>
    isEnabled: boolean
    college: College | null
    department: Department | null
    faculty: Faculty | null
    user: User | null
}

type UserCardProps = {
    userId: string
    modalOpen: boolean
    setModalOpen: (open: boolean) => void
}

export function UserModal({ userId, modalOpen, setModalOpen }: UserCardProps) {
    const provision = useProvisionUser()
    const { userSession } = useAuthentication()
    const [provisionParams, setProvisionParams] = useState<
        ProvisionState | undefined
    >(undefined)

    const { data: user, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ users: usersCollection })
                .where(({ users }) => eq(users.id, userId))
                .findOne(),
        [userId],
    )

    const { data: userRoles } = useLiveQuery(
        (q) =>
            q
                .from({ userRoles: userRolesCollection })
                .leftJoin({ roles: rolesCollection }, ({ userRoles, roles }) =>
                    eq(userRoles.role_id, roles.id),
                )
                .where(({ userRoles }) => eq(userRoles.user_id, userId))
                .select(({ roles }) => ({
                    role: {
                        id: roles?.id,
                        name: roles?.name,
                    },
                })),
        [userId],
    )

    if (isLoading || !user) return null

    // Check if all required provision parameters are set
    const provisionParamsCompleted =
        provisionParams &&
        provisionParams.college &&
        provisionParams.department &&
        provisionParams.faculty &&
        provisionParams.roles?.length > 0 &&
        provisionParams.isEnabled !== undefined

    return (
        <Dialog
            open={modalOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setModalOpen(false)
                    setProvisionParams(undefined)
                }
            }}
        >
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>User Provisioning</DialogTitle>
                    <DialogDescription>
                        Detailed information and provisioning options for{' '}
                        {user.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <span className="font-medium">Faculty:</span>
                    <FacultySelector
                        user={user}
                        provisionParams={provisionParams}
                        setProvisionParams={setProvisionParams}
                    />

                    <span className="font-medium">Department:</span>
                    <DepartmentSelector
                        provisionParams={provisionParams}
                        setProvisionParams={setProvisionParams}
                    />

                    <span className="font-medium">College:</span>
                    <CollegeSelector
                        provisionParams={provisionParams}
                        setProvisionParams={setProvisionParams}
                    />

                    <span className="font-medium">
                        Account Enabled:
                        {user.mnumber === userSession?.user.mnumber && (
                            <span className="text-sm text-red-500 ml-2">
                                (You cannot change your own account status)
                            </span>
                        )}
                    </span>

                    {/* Account Enabled Toggle Conditionally Enabled Based on User */}
                    <fieldset
                        disabled={user.mnumber === userSession?.user.mnumber}
                    >
                        <Tabs
                            defaultValue={user.isEnabled ? 'yes' : 'no'}
                            onValueChange={(value) => {
                                setProvisionParams((prev) => ({
                                    ...prev!,
                                    isEnabled: value === 'yes',
                                }))
                            }}
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger
                                    value="yes"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Yes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="no"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    No
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </fieldset>

                    <span className="font-medium">Roles:</span>
                    <MultiRoleSelector
                        userMnumber={user.mnumber || ''}
                        roles={userRoles.map((r) => r.role.name || '')}
                        onRolesChange={(value) => {
                            setProvisionParams((prev) => ({
                                ...prev!,
                                roles: value,
                            }))
                        }}
                    />
                    <div className="mt-auto flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                if (!provisionParamsCompleted) {
                                    toast.error(
                                        'Please complete all provisioning parameters',
                                    )
                                    return
                                }

                                const selfProvisioning =
                                    user.mnumber === userSession?.user.mnumber

                                provision.mutate(
                                    {
                                        ...provisionParams,
                                        // Ensure the user cannot disable their own account. Also handled server-side.
                                        isEnabled: selfProvisioning
                                            ? true
                                            : provisionParams.isEnabled,
                                        department: provisionParams.department!,
                                        college: provisionParams.college!,
                                        faculty: provisionParams.faculty!,
                                        user: provisionParams.user!,
                                    },
                                    {
                                        onSuccess: () => {
                                            toast.success(
                                                'User provisioned successfully',
                                            )
                                            // Invalidate users query to refresh user data
                                            getQueryClient().invalidateQueries({
                                                queryKey: ['users'],
                                            })
                                        },
                                        onError: (err) => {
                                            toast.error(err.message)
                                        },
                                    },
                                )
                                setModalOpen(false)
                                setProvisionParams(undefined)
                            }}
                            disabled={
                                provision.isPending || !provisionParamsCompleted
                            }
                        >
                            {provision.isPending
                                ? 'Provisioning...'
                                : 'Provision'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
