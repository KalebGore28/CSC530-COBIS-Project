import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useAuthentication } from "@/lib/auth-client";
import { formatRoleName } from "@/lib/roles";
import { cn } from "@/lib/utils";

import { usersCollection } from "@/integrations/tanstack-db/users";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { userRolesCollection } from "@/integrations/tanstack-db/user-roles";
import {
  collegesByNameQuery,
  departmentsByNameQuery,
  facultyByNameQuery,
  rolesByNameQuery,
} from "@/queries/lookups";

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

const contentClassName = "flex max-h-[85dvh] flex-col sm:max-w-2xl";

export function UserModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      {/* Only mounted while open, so edits start fresh each time and closed modals run no queries */}
      {open && <UserForm userId={userId} onClose={() => setOpen(false)} />}
    </Dialog>
  );
}

function UserForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { userSession } = useAuthentication();
  const dbClient = useDbClient();
  const [edits, setEdits] = useState<UserEdits>({});
  const [openField, setOpenField] = useState<"faculty" | "department" | "college" | null>(null);
  // Missing fields are only flagged once the admin has tried to save
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Closing with unsaved changes asks first, instead of silently dropping them
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const { data: user, isLoading: isUserLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ users: usersCollection })
        .where(({ users }) => eq(users.id, userId))
        .findOne(),
  });

  const { data: facultyList, isLoading: isFacultyLoading } = useLiveQuery({
    query: facultyByNameQuery(),
  });

  const { data: departmentList, isLoading: isDepartmentsLoading } = useLiveQuery({
    query: departmentsByNameQuery(),
  });

  const { data: collegeList, isLoading: isCollegesLoading } = useLiveQuery({
    query: collegesByNameQuery(),
  });

  const { data: roleList, isLoading: isRolesLoading } = useLiveQuery({
    query: rolesByNameQuery(),
  });

  const { data: userRoles, isLoading: isUserRolesLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ userRoles: userRolesCollection })
        .where(({ userRoles }) => eq(userRoles.user_id, userId)),
  });

  const isLoaded =
    !isUserLoading &&
    !isFacultyLoading &&
    !isDepartmentsLoading &&
    !isCollegesLoading &&
    !isRolesLoading &&
    !isUserRolesLoading &&
    !!user;

  // The dialog opens on a loading skeleton, so focus moves to the first field once it appears.
  // Focusing it doesn't open the phone keyboard, as it's a button.
  const facultyRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isLoaded) facultyRef.current?.focus();
  }, [isLoaded]);

  // The safe choice gets focus, so pressing Enter by habit keeps the edits
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirmingDiscard) keepEditingRef.current?.focus();
  }, [confirmingDiscard]);

  if (!isLoaded || !user) {
    return (
      <DialogContent className={contentClassName}>
        <DialogTitle className="sr-only">Loading user</DialogTitle>
        <Skeleton className="h-80 w-full" />
      </DialogContent>
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

  const showMissing = showErrors && !isComplete;

  const requestClose = () => {
    if (hasChanges) setConfirmingDiscard(true);
    else onClose();
  };

  // Esc and clicks outside close the dialog only when nothing would be lost
  const guardClose = (event: Event) => {
    if (isSaving) {
      event.preventDefault();
    } else if (hasChanges) {
      event.preventDefault();
      setConfirmingDiscard(true);
    }
  };

  const focusFirstMissing = () => {
    const firstMissing = !selectedFaculty
      ? "user-faculty"
      : !selectedDepartment
        ? "user-department"
        : !selectedCollege
          ? "user-college"
          : roleList[0] && `user-role-${roleList[0].id}`;
    if (firstMissing) document.getElementById(firstMissing)?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (!hasChanges) {
      onClose();
      return;
    }
    if (!isComplete || !selectedFaculty || !selectedDepartment || !selectedCollege) {
      setShowErrors(true);
      focusFirstMissing();
      return;
    }

    const transactions: Array<{
      when: (state: "settled") => Promise<unknown>;
    }> = [];

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

    // Stay open until every save settles, so a failed one keeps the edits to try again.
    // A failed save rejects here after showing its own error toast.
    setIsSaving(true);
    Promise.all(transactions.map((transaction) => transaction.when("settled")))
      .then(() => {
        onClose();
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
      .catch(() => setIsSaving(false));
  };

  return (
    <DialogContent
      className={contentClassName}
      showCloseButton={false}
      onEscapeKeyDown={guardClose}
      onInteractOutside={guardClose}
    >
      <DialogHeader>
        <DialogTitle>{user.name}</DialogTitle>
        <DialogDescription>{user.email}</DialogDescription>
      </DialogHeader>

      <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleSubmit}>
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
                      ref={facultyRef}
                      id="user-faculty"
                      type="button"
                      variant="outline"
                      aria-invalid={(showMissing && !selectedFaculty) || undefined}
                      aria-describedby={
                        showMissing && !selectedFaculty ? "user-form-error" : undefined
                      }
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
                      type="button"
                      variant="outline"
                      aria-invalid={(showMissing && !selectedDepartment) || undefined}
                      aria-describedby={
                        showMissing && !selectedDepartment ? "user-form-error" : undefined
                      }
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
                      type="button"
                      variant="outline"
                      aria-invalid={(showMissing && !selectedCollege) || undefined}
                      aria-describedby={
                        showMissing && !selectedCollege ? "user-form-error" : undefined
                      }
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

        {confirmingDiscard ? (
          <DialogFooter className="items-center">
            {/* Stacked phone footers run bottom-up, so this keeps the question on top */}
            <p role="alert" className="mr-auto text-sm font-medium max-sm:order-last">
              Discard your unsaved changes?
            </p>
            <Button
              ref={keepEditingRef}
              type="button"
              variant="outline"
              className="max-sm:w-full"
              onClick={() => setConfirmingDiscard(false)}
            >
              Keep editing
            </Button>
            <Button type="button" variant="destructive" className="max-sm:w-full" onClick={onClose}>
              Discard
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="items-center">
            {!isComplete && (
              // Persistent help that turns into an announced error after a failed save
              <p
                id="user-form-error"
                role={showMissing ? "alert" : undefined}
                className={cn(
                  "mr-auto text-sm max-sm:order-last",
                  showMissing ? "text-destructive font-medium" : "text-muted-foreground",
                )}
              >
                Choose a faculty member, department, college, and at least one role.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="max-sm:w-full"
              disabled={isSaving}
              onClick={requestClose}
            >
              Cancel
            </Button>
            {/* Disabled only while saving, to prevent double saves */}
            <Button type="submit" className="max-sm:w-full" disabled={isSaving}>
              {isSaving && <Spinner />}
              Save changes
            </Button>
          </DialogFooter>
        )}
      </form>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2"
        disabled={isSaving}
        onClick={requestClose}
      >
        <XIcon />
        <span className="sr-only">Close</span>
      </Button>
    </DialogContent>
  );
}
