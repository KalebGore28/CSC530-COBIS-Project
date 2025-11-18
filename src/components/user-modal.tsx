import { CollegeSelector } from '@/components/selectors/college-selector';
import { DepartmentSelector } from '@/components/selectors/department-selector';
import { FacultySelector } from '@/components/selectors/faculty-selector';
import { MultiRoleSelector } from '@/components/selectors/multi-role-selector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Modal } from '@/components/ui/custom/modal';
import { useProvisionUser, ProvisionParams } from '@/hooks/use-provision-user';
import { useSession } from '@/components/provider/session';
import { useState } from 'react';
import { toast } from "sonner";

import { usersCollection } from '@/collections/users';
import { facultyCollection } from '@/collections/faculty';
import { departmentsCollection } from '@/collections/departments';
import { collegesCollection } from '@/collections/colleges';
import { userRolesCollection } from '@/collections/user-roles';
import { rolesCollection } from '@/collections/roles';
import { useLiveQuery, eq } from '@tanstack/react-db';

import { getQueryClient } from '@/providers/queryClient';

type UserCardProps = {
    userId: string;
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
};

export function UserModal({ userId, modalOpen, setModalOpen }: UserCardProps) {
    const provision = useProvisionUser();
    const { session } = useSession();
    const [provisionParams, setProvisionParams] = useState<ProvisionParams>({
        roles: [],
        isEnabled: false,
        collegeCode: "",
        departmentCode: "",
        mnumber: "",
        userId: "",
    });

    const { data: user, isLoading } = useLiveQuery((q) =>
        q.from({ users: usersCollection })
            .leftJoin({ faculty: facultyCollection }, ({ users, faculty }) =>
                eq(users.mnumber, faculty.mnumber)
            )
            .leftJoin({ departments: departmentsCollection }, ({ faculty, departments }) =>
                eq(faculty?.department_code, departments.code)
            )
            .leftJoin({ colleges: collegesCollection }, ({ faculty, colleges }) =>
                eq(faculty?.college_code, colleges.code)
            )
            .where(({ users }) => eq(users.id, userId))
            .select(({ users, departments, colleges }) => ({
                id: users.id,
                mnumber: users.mnumber,
                isEnabled: users.isEnabled,
                department_code: departments?.code,
                college_code: colleges?.code,
            }))
            .findOne(),
        [userId]
    );

    const { data: userRoles } = useLiveQuery((q) =>
        q.from({ userRoles: userRolesCollection })
            .leftJoin({ roles: rolesCollection }, ({ userRoles, roles }) =>
                eq(userRoles.role_id, roles.id)
            )
            .where(({ userRoles }) => eq(userRoles.user_id, userId))
            .select(({ roles }) => ({
                role: {
                    id: roles?.id,
                    name: roles?.name,
                },
            })),
        [userId]
    );

    if (isLoading || !user) return null;

    return (
        <Modal
            isOpen={modalOpen}
            onClose={() => {
                setModalOpen(false);
                setProvisionParams({
                    roles: [],
                    isEnabled: false,
                    collegeCode: "",
                    departmentCode: "",
                    mnumber: "",
                    userId: "",
                });
            }}
            title="Provision User"
            description="Fill in the details to provision this user."
            size="xl"
        >
            <div className="flex flex-col p-4 w-full max-h-[80vh] overflow-y-auto">
                <div className="flex-1 overflow-y-auto space-y-6">

                    <span className="font-medium">Faculty:</span>
                    <FacultySelector
                        mnumber={user.mnumber}
                        onSelectChange={(value) => {
                            setProvisionParams((prev) => ({
                                ...prev,
                                mnumber: value?.mnumber || "",
                                userId: user.id || "",
                            }));
                        }}
                    />

                    <span className="font-medium">Department:</span>
                    <DepartmentSelector
                        departmentCode={user.department_code}
                        onSelectChange={(value) => {
                            setProvisionParams((prev) => ({
                                ...prev,
                                departmentCode: value?.code || "",
                            }));
                        }}
                    />

                    <span className="font-medium">College:</span>
                    <CollegeSelector
                        collegeCode={user.college_code}
                        onSelectChange={(value) => {
                            setProvisionParams((prev) => ({
                                ...prev,
                                collegeCode: value?.code || "",
                            }));
                        }}
                    />

                    <span className="font-medium">
                        Account Enabled:
                        {user.mnumber === session?.mnumber && (
                            <span className="text-sm text-red-500 ml-2">
                                (You cannot change your own account status)
                            </span>
                        )}
                    </span>

                    {/* Account Enabled Toggle Conditionally Enabled Based on User */}
                    <fieldset disabled={user.mnumber === session?.mnumber}>
                        <Tabs
                            defaultValue={user.isEnabled ? "yes" : "no"}
                            onValueChange={(value) => {
                                setProvisionParams((prev) => ({
                                    ...prev,
                                    isEnabled: value === "yes",
                                }));

                            }}
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="yes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    Yes
                                </TabsTrigger>
                                <TabsTrigger value="no" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    No
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </fieldset>

                    <span className="font-medium">Roles:</span>
                    <MultiRoleSelector
                        userMnumber={user.mnumber || ""}
                        roles={userRoles.map((r) => r.role.name || "")}
                        onRolesChange={(value) => {
                            setProvisionParams((prev) => ({
                                ...prev,
                                roles: value,
                            }));
                        }}
                    />
                    <div className="mt-auto flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                const selfProvision = user.mnumber === session?.mnumber;
                                const finalParams = {
                                    ...provisionParams,
                                    isEnabled: selfProvision ? true : provisionParams.isEnabled,
                                };

                                provision.mutate(finalParams, {
                                    onSuccess: () => {
                                        toast.success("User provisioned successfully");
                                        // Invalidate users query to refresh user data
                                        getQueryClient().invalidateQueries({ queryKey: ['users'] });
                                        
                                    },
                                    onError: (err) => {
                                        toast.error(err.message);
                                    },
                                });
                                setModalOpen(false);
                                setProvisionParams({
                                    roles: [],
                                    isEnabled: false,
                                    collegeCode: "",
                                    departmentCode: "",
                                    mnumber: "",
                                    userId: "",
                                });
                            }}
                            disabled={provision.isPending}
                        >
                            {provision.isPending ? "Provisioning..." : "Provision"}
                        </Button>

                    </div>
                </div>
            </div>
        </Modal>
    )

}