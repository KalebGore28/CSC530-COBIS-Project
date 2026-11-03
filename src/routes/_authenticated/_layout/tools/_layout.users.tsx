import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { eq, ilike, or, useLiveQuery } from "@tanstack/react-db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { usersCollection } from "@/integrations/tanstack-db/users";
import { facultyCollection } from "@/integrations/tanstack-db/faculty";
import { departmentsCollection } from "@/integrations/tanstack-db/departments";
import { collegesCollection } from "@/integrations/tanstack-db/colleges";

import { UserModal } from "@/components/user-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string | null | undefined): string => {
  if (!name) {
    return "??";
  }
  return name
    .split(" ")
    .map((n) => (n && n[0] ? n[0] : ""))
    .join("")
    .toUpperCase();
};

// Google profile picture URLs end in a size like =s96-c, which looks soft on high-density screens
const getLargeProfileImage = (image: string | null): string => {
  return image?.replace(/=s\d+(-c)?$/, "=s300-c") ?? "";
};

export const Route = createFileRoute("/_authenticated/_layout/tools/_layout/users")({
  beforeLoad: ({ context }) => {
    const dbClient = context.dbClient;
    void dbClient.collection(usersCollection).preload();
    void dbClient.collection(facultyCollection).preload();
  },
  component: RouteComponent,
  context: () => ({ getTitle: () => "Manage Users" }),
});

function RouteComponent() {
  const [query, setQuery] = useState("");

  const { data: filteredUsers, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ users: usersCollection })
        .leftJoin({ faculty: facultyCollection }, ({ users, faculty }) =>
          eq(users.mnumber, faculty.mnumber),
        )
        .leftJoin({ departments: departmentsCollection }, ({ faculty, departments }) =>
          eq(faculty?.department_id, departments.id),
        )
        .leftJoin({ colleges: collegesCollection }, ({ faculty, colleges }) =>
          eq(faculty?.college_id, colleges.id),
        )
        .where(({ users }) =>
          or(
            ilike(users.name, `%${query}%`),
            ilike(users.mnumber, `%${query}%`),
            ilike(users.email, `%${query}%`),
          ),
        )
        .orderBy(({ users }) => users.name, "asc")
        .select(({ users, departments, colleges }) => ({
          id: users.id,
          mnumber: users.mnumber,
          name: users.name,
          email: users.email,
          image: users.image,
          isEnabled: users.isEnabled,
          lastLogin: users.lastLogin,
          department_description: departments?.description,
          college_description: colleges?.description,
        })),
    [query], // Re-run when query changes
  );

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  return (
    <div className="@container mx-auto max-w-4xl space-y-4">
      <Input
        placeholder="Search by name, M#, or email..."
        aria-label="Search users"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filteredUsers.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>Try a different name, M#, or email.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
            <div className="bg-muted/50 flex items-center">
              <Avatar className="size-24 self-start rounded-none after:hidden">
                <AvatarImage
                  className="rounded-none"
                  src={getLargeProfileImage(user.image)}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="rounded-none text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <CardHeader className="min-w-0 flex-1 py-(--card-spacing)">
                <CardTitle className="text-lg wrap-anywhere">{user.name}</CardTitle>
                <CardDescription className="wrap-anywhere">{user.email}</CardDescription>
              </CardHeader>
            </div>
            <div className="flex flex-1 flex-col gap-3 py-(--card-spacing)">
              <CardContent className="text-muted-foreground flex flex-col gap-1">
                <span>{user.mnumber ?? "No M# set"}</span>
                {(user.department_description || user.college_description) && (
                  <span>
                    {[user.department_description, user.college_description]
                      .filter(Boolean)
                      .join(" • ")}
                  </span>
                )}
                <span>
                  Last login{" "}
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "never"}
                </span>
              </CardContent>
              <CardContent className="mt-auto flex flex-wrap items-center gap-2">
                <Badge variant={user.isEnabled ? "default" : "destructive"}>
                  {user.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {user.mnumber === null && <Badge variant="secondary">Action Required</Badge>}
                <div className="ml-auto">
                  <UserModal userId={user.id} />
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
