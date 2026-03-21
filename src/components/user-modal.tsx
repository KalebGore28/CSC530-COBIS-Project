import { useState } from 'react'
import { toast } from 'sonner'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { DialogTrigger } from '@radix-ui/react-dialog'
import type { colleges, departments, faculty, roles, user } from '@/db/schema'
import { CollegeSelector } from '@/components/selectors/college-selector'
import { DepartmentSelector } from '@/components/selectors/department-selector'
import { FacultySelector } from '@/components/selectors/faculty-selector'
import { MultiRoleSelector } from '@/components/selectors/multi-role-selector'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useAuthentication } from '@/lib/auth-client'

import { usersCollection } from '@/integrations/tanstack-db/users'
import { facultyCollection } from '@/integrations/tanstack-db/faculty'
import { userRolesCollection } from '@/integrations/tanstack-db/user-roles'
import { rolesCollection } from '@/integrations/tanstack-db/roles'

type Role = typeof roles.$inferSelect
type Department = typeof departments.$inferSelect
type College = typeof colleges.$inferSelect
type Faculty = typeof faculty.$inferSelect
type User = typeof user.$inferSelect

export type ProvisionState = {
    roles: Array<Role> | null
    isEnabled: boolean | null
    college: College | null
    department: Department | null
    faculty: Faculty | null
    user: User | null
}

type UserCardProps = {
    userId: string | null
}

export function UserModal({ userId }: UserCardProps) {
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

    const { data: userRoleData } = useLiveQuery(
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">View Details</Button>
            </DialogTrigger>
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

                    <fieldset
                        disabled={!provisionParams?.faculty}
                        className={
                            !provisionParams?.faculty ? 'opacity-50' : ''
                        }
                    >
                        <span className="font-medium">Department:</span>
                        <DepartmentSelector
                            provisionParams={provisionParams}
                            setProvisionParams={setProvisionParams}
                        />
                    </fieldset>

                    <fieldset
                        disabled={!provisionParams?.faculty}
                        className={
                            !provisionParams?.faculty ? 'opacity-50' : ''
                        }
                    >
                        <span className="font-medium">College:</span>
                        <CollegeSelector
                            provisionParams={provisionParams}
                            setProvisionParams={setProvisionParams}
                        />
                    </fieldset>

                    {/* Account Enabled Toggle Conditionally Enabled Based on User */}
                    <fieldset
                        disabled={
                            !provisionParams?.faculty ||
                            user.mnumber === userSession?.user.mnumber
                        }
                        className={
                            !provisionParams?.faculty ? 'opacity-50' : ''
                        }
                    >
                        <span className="font-medium">
                            Enabled:
                            {user.mnumber === userSession?.user.mnumber && (
                                <span className="ml-2 text-sm text-red-500">
                                    (Cannot change your own account status)
                                </span>
                            )}
                        </span>
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

                    <fieldset
                        disabled={!provisionParams?.faculty}
                        className={
                            !provisionParams?.faculty ? 'opacity-50' : ''
                        }
                    >
                        <span className="font-medium">Roles:</span>
                        <MultiRoleSelector
                            userMnumber={user.mnumber || ''}
                            userRoles={userRoleData.map(
                                (r) => r.role.name || '',
                            )}
                            onRolesChange={(value) => {
                                setProvisionParams((prev) => ({
                                    ...prev!,
                                    roles: value,
                                }))
                            }}
                        />
                    </fieldset>
                </div>
                <DialogFooter className="p-2">
                    {provisionParams && (
                        <DialogClose asChild>
                            <Button
                                onClick={() => {
                                    const {
                                        faculty,
                                        department,
                                        college,
                                        roles,
                                        isEnabled,
                                    } = provisionParams

                                    if (
                                        !faculty ||
                                        !department ||
                                        !college ||
                                        !roles ||
                                        !isEnabled
                                    ) {
                                        toast.error(
                                            'Please select faculty, department, college, roles, and enabled status before provisioning.',
                                        )
                                        return
                                    }

                                    console.log(
                                        'Provisioning with params:',
                                        provisionParams,
                                    )

                                    const selfProvisioning =
                                        user.mnumber ===
                                        userSession?.user.mnumber

                                    usersCollection.update(user.id, (draft) => {
                                        draft.mnumber =
                                            faculty.mnumber || user.mnumber
                                        draft.isEnabled = selfProvisioning
                                            ? true
                                            : isEnabled
                                    })

                                    facultyCollection.update(
                                        faculty.mnumber,
                                        (draft) => {
                                            draft.department_id =
                                                department.id ||
                                                draft.department_id
                                            draft.college_id =
                                                college.id || draft.college_id
                                        },
                                    )

                                    // Get current roles for the user to determine which to add and which to remove
                                    const currentRoles = userRoleData.map(
                                        (ur) => ur.role,
                                    )
                                    const rolesToAdd = roles.filter(
                                        (role) =>
                                            !currentRoles.some(
                                                (r) => r.id === role.id,
                                            ),
                                    )
                                    const rolesToRemove = currentRoles.filter(
                                        (role) =>
                                            !roles.some(
                                                (r) => r.id === role.id,
                                            ),
                                    )

                                    // Remove all roles associated with the user and then re-add based on selection
                                    if (rolesToRemove.length > 0) {
                                        userRolesCollection.delete(
                                            rolesToRemove.map(
                                                (role) =>
                                                    `${user.id}-${role.id}`,
                                            ) as Array<`${string}-${number}`>,
                                        )
                                    }

                                    // Next add the selected roles
                                    if (rolesToAdd.length > 0) {
                                        userRolesCollection.insert(
                                            rolesToAdd.map((role) => ({
                                                user_id: user.id,
                                                role_id: role.id,
                                            })) as Array<{
                                                user_id: string
                                                role_id: number
                                            }>,
                                        )
                                    }

                                    // If it is a self provision, we need to refresh the app to update the session with new roles and permissions
                                    if (selfProvisioning) {
                                        toast.success(
                                            'Your account has been updated. The app will refresh to apply new permissions.',
                                        )
                                        setTimeout(() => {
                                            window.location.reload()
                                        }, 2000)
                                    } else {
                                        toast.success(
                                            'User provisioned successfully.',
                                        )
                                    }
                                }}
                            >
                                Update User
                            </Button>
                        </DialogClose>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
