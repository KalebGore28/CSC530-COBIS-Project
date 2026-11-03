import { useState } from "react";
import { toast } from "sonner";
import { ChevronsUpDownIcon } from "lucide-react";
import { eq, useDbClient, useLiveQuery } from "@tanstack/react-db";
import type { colleges, departments, faculty } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuthentication } from "@/lib/auth-client";
import { formatRoleName } from "@/lib/roles";

import { usersCollection } from "@/integrations/tanstack-db/users";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";
import { userRolesCollection } from "@/integrations/tanstack-db/user-roles";
import { rolesCollection } from "@/integrations/tanstack-db/roles";

type Department = typeof departments.$inferSelect;
type College = typeof colleges.$inferSelect;
type Faculty = typeof faculty.$inferSelect;

// Only what the admin has changed. Everything else shows the saved value.
type UserEdits = {
  faculty?: Faculty;
  department?: Department | null;
  college?: College | null;
  isEnabled?: boolean;
  roleIds?: Array<number>;
};

export function UserModal({ userId }: { userId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      {/* Focusing the first field would open the keyboard on phones */}
      <DialogContent
        className="flex max-h-[85dvh] flex-col sm:max-w-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {/* Only mounted while open, so edits start fresh each time and closed modals run no queries */}
        <UserForm userId={userId} />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({ userId }: { userId: string }) {
  const { userSession } = useAuthentication();
  const dbClient = useDbClient();
  const [edits, setEdits] = useState<UserEdits>({});
  const [openField, setOpenField] = useState<"faculty" | "department" | "college" | null>(null);

  const { data: user, isLoading: isUserLoading } = useLiveQuery(
    (q) =>
      q
        .from({ users: usersCollection })
        .where(({ users }) => eq(users.id, userId))
        .findOne(),
    [userId],
  );

  const { data: facultyList, isLoading: isFacultyLoading } = useLiveQuery((q) =>
    q.from({ faculty: facultyCollection }).orderBy(({ faculty }) => faculty.last_name, "asc"),
  );

  const { data: departmentList, isLoading: isDepartmentsLoading } = useLiveQuery((q) =>
    q
      .from({ departments: departmentsCollection })
      .orderBy(({ departments }) => departments.description, "asc"),
  );

  const { data: collegeList, isLoading: isCollegesLoading } = useLiveQuery((q) =>
    q.from({ colleges: collegesCollection }).orderBy(({ colleges }) => colleges.description, "asc"),
  );

  const { data: roleList, isLoading: isRolesLoading } = useLiveQuery((q) =>
    q.from({ roles: rolesCollection }).orderBy(({ roles }) => roles.name, "asc"),
  );

  const { data: userRoles, isLoading: isUserRolesLoading } = useLiveQuery(
    (q) =>
      q
        .from({ userRoles: userRolesCollection })
        .where(({ userRoles }) => eq(userRoles.user_id, userId)),
    [userId],
  );

  if (
    isUserLoading ||
    isFacultyLoading ||
    isDepartmentsLoading ||
    isCollegesLoading ||
    isRolesLoading ||
    isUserRolesLoading ||
    !user
  ) {
    return (
      <>
        <DialogTitle className="sr-only">Loading user</DialogTitle>
        <Skeleton className="h-80 w-full" />
      </>
    );
  }

  const savedFaculty = facultyList.find((f) => f.mnumber === user.mnumber) ?? null;
  const selectedFaculty = edits.faculty ?? savedFaculty;

  const savedDepartment = departmentList.find((d) => d.id === savedFaculty?.department_id) ?? null;
  const selectedDepartment = edits.department !== undefined ? edits.department : savedDepartment;

  const savedCollege = collegeList.find((c) => c.id === savedFaculty?.college_id) ?? null;
  const selectedCollege = edits.college !== undefined ? edits.college : savedCollege;

  const isEnabled = edits.isEnabled ?? user.isEnabled;
  const savedRoleIds = userRoles.map((userRole) => userRole.role_id);
  const selectedRoleIds = edits.roleIds ?? savedRoleIds;

  const isOwnAccount = user.id === userSession?.user.id;

  const userChanged = selectedFaculty?.mnumber !== user.mnumber || isEnabled !== user.isEnabled;
  const facultyChanged =
    selectedDepartment?.id !== selectedFaculty?.department_id ||
    selectedCollege?.id !== selectedFaculty?.college_id;
  const rolesToAdd = selectedRoleIds.filter((id) => !savedRoleIds.includes(id));
  const rolesToRemove = savedRoleIds.filter((id) => !selectedRoleIds.includes(id));

  const hasChanges =
    userChanged || facultyChanged || rolesToAdd.length > 0 || rolesToRemove.length > 0;
  const isComplete =
    !!selectedFaculty && !!selectedDepartment && !!selectedCollege && selectedRoleIds.length > 0;

  const handleFacultyChange = (nextFaculty: Faculty) => {
    // A faculty member brings their own department and college, which can then be changed
    setEdits({
      ...edits,
      faculty: nextFaculty,
      department: departmentList.find((d) => d.id === nextFaculty.department_id) ?? null,
      college: collegeList.find((c) => c.id === nextFaculty.college_id) ?? null,
    });
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setEdits({
      ...edits,
      roleIds: checked
        ? [...selectedRoleIds, roleId]
        : selectedRoleIds.filter((id) => id !== roleId),
    });
  };

  const handleSave = () => {
    if (!selectedFaculty || !selectedDepartment || !selectedCollege) return;

    const transactions: Array<{ when: (state: "settled") => Promise<unknown> }> = [];

    if (userChanged) {
      transactions.push(
        dbClient.collection(usersCollection).update(user.id, (draft) => {
          draft.mnumber = selectedFaculty.mnumber;
          draft.isEnabled = isOwnAccount ? true : isEnabled;
        }),
      );
    }

    if (facultyChanged) {
      transactions.push(
        dbClient.collection(facultyCollection).update(selectedFaculty.mnumber, (draft) => {
          draft.department_id = selectedDepartment.id;
          draft.college_id = selectedCollege.id;
        }),
      );
    }

    if (rolesToRemove.length > 0) {
      transactions.push(
        dbClient
          .collection(userRolesCollection)
          .delete(rolesToRemove.map((id) => `${user.id}-${id}`) as Array<`${string}-${number}`>),
      );
    }

    if (rolesToAdd.length > 0) {
      transactions.push(
        dbClient
          .collection(userRolesCollection)
          .insert(rolesToAdd.map((id) => ({ user_id: user.id, role_id: id }))),
      );
    }

    // Wait for every save, as a failed one rejects here after its own error toast
    Promise.all(transactions.map((transaction) => transaction.when("settled")))
      .then(() => {
        // Your own roles and permissions are in the session, so the app has to refresh to apply them
        if (isOwnAccount) {
          toast.success(
            "Your account has been updated. The app will refresh to apply new permissions.",
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      })
      .catch(() => undefined);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{user.name}</DialogTitle>
        <DialogDescription>{user.email}</DialogDescription>
      </DialogHeader>

      <div className="-mx-4 grid min-h-0 flex-1 gap-6 overflow-y-auto px-4 py-1 sm:grid-cols-2">
        <FieldSet>
          <FieldLegend>Faculty record</FieldLegend>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="user-faculty">Faculty member</FieldLabel>
              <Popover
                modal
                open={openField === "faculty"}
                onOpenChange={(open) => setOpenField(open ? "faculty" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="user-faculty"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openField === "faculty"}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedFaculty
                        ? `${selectedFaculty.first_name} ${selectedFaculty.last_name} (${selectedFaculty.mnumber})`
                        : "Select a faculty member"}
                    </span>
                    <ChevronsUpDownIcon className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or M#..." />
                    <CommandList>
                      <CommandEmpty>No faculty found</CommandEmpty>
                      <CommandGroup>
                        {facultyList.map((f) => (
                          <CommandItem
                            key={f.mnumber}
                            value={`${f.first_name} ${f.last_name} ${f.mnumber}`}
                            data-checked={f.mnumber === selectedFaculty?.mnumber}
                            className="max-md:py-2.5"
                            onSelect={() => {
                              handleFacultyChange(f);
                              setOpenField(null);
                            }}
                          >
                            {f.first_name} {f.last_name} ({f.mnumber})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            <Field data-disabled={!selectedFaculty}>
              <FieldLabel htmlFor="user-department">Department</FieldLabel>
              <Popover
                modal
                open={openField === "department"}
                onOpenChange={(open) => setOpenField(open ? "department" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="user-department"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openField === "department"}
                    className="w-full justify-between font-normal"
                    disabled={!selectedFaculty}
                  >
                    <span className="truncate">
                      {selectedDepartment?.description ?? "Select a department"}
                    </span>
                    <ChevronsUpDownIcon className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search departments..." />
                    <CommandList>
                      <CommandEmpty>No departments found</CommandEmpty>
                      <CommandGroup>
                        {departmentList.map((d) => (
                          <CommandItem
                            key={d.id}
                            value={`${d.description} ${d.id}`}
                            data-checked={d.id === selectedDepartment?.id}
                            className="max-md:py-2.5"
                            onSelect={() => {
                              setEdits({ ...edits, department: d });
                              setOpenField(null);
                            }}
                          >
                            {d.description}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            <Field data-disabled={!selectedFaculty}>
              <FieldLabel htmlFor="user-college">College</FieldLabel>
              <Popover
                modal
                open={openField === "college"}
                onOpenChange={(open) => setOpenField(open ? "college" : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="user-college"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openField === "college"}
                    className="w-full justify-between font-normal"
                    disabled={!selectedFaculty}
                  >
                    <span className="truncate">
                      {selectedCollege?.description ?? "Select a college"}
                    </span>
                    <ChevronsUpDownIcon className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search colleges..." />
                    <CommandList>
                      <CommandEmpty>No colleges found</CommandEmpty>
                      <CommandGroup>
                        {collegeList.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.description} ${c.id}`}
                            data-checked={c.id === selectedCollege?.id}
                            className="max-md:py-2.5"
                            onSelect={() => {
                              setEdits({ ...edits, college: c });
                              setOpenField(null);
                            }}
                          >
                            {c.description}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Account</FieldLegend>
          <FieldGroup className="gap-4">
            <Field orientation="horizontal" data-disabled={isOwnAccount}>
              <FieldContent>
                <FieldLabel htmlFor="user-enabled">Account enabled</FieldLabel>
                {isOwnAccount && (
                  <FieldDescription>You can't disable your own account.</FieldDescription>
                )}
              </FieldContent>
              <Switch
                id="user-enabled"
                checked={isEnabled}
                disabled={isOwnAccount}
                onCheckedChange={(checked) => setEdits({ ...edits, isEnabled: checked })}
              />
            </Field>

            <FieldSet className="gap-1">
              <FieldLegend variant="label">Roles</FieldLegend>
              {roleList.map((role) => {
                const isLocked = isOwnAccount && role.name === "cobis_administrator";

                return (
                  <Field
                    key={role.id}
                    orientation="horizontal"
                    className="min-h-(--control-height) items-center"
                    data-disabled={isLocked}
                  >
                    <Checkbox
                      id={`user-role-${role.id}`}
                      checked={selectedRoleIds.includes(role.id)}
                      disabled={isLocked}
                      onCheckedChange={(checked) => handleRoleChange(role.id, checked === true)}
                    />
                    <FieldLabel htmlFor={`user-role-${role.id}`} className="font-normal">
                      {formatRoleName(role.name)}
                    </FieldLabel>
                  </Field>
                );
              })}
              {isOwnAccount && (
                <FieldDescription>You can't remove your own administrator role.</FieldDescription>
              )}
            </FieldSet>
          </FieldGroup>
        </FieldSet>
      </div>

      <DialogFooter className="items-center">
        {!isComplete && (
          <p className="text-muted-foreground mr-auto text-sm">
            Choose a faculty member, department, college, and at least one role.
          </p>
        )}
        <DialogClose asChild>
          <Button variant="outline" className="max-sm:w-full">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            className="max-sm:w-full"
            disabled={!hasChanges || !isComplete}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
