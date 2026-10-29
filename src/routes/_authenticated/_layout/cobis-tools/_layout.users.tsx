import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { eq, ilike, or, useLiveQuery } from "@tanstack/react-db";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export const Route = createFileRoute("/_authenticated/_layout/cobis-tools/_layout/users")({
  beforeLoad: () => {
    void usersCollection.preload();
    void facultyCollection.preload();
    void departmentsCollection.preload();
    void collegesCollection.preload();
  },
  component: RouteComponent,
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
    <div className="space-y-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
          <CardDescription>Search by name, M#, or email.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 md:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="h-full">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={user.image ?? ""} alt={user.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.name}
                <Badge variant={user.isEnabled ? "default" : "destructive"}>
                  {user.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">M#:</span>
                  <span>{user.mnumber ?? "Not set"}</span>
                </div>
                {(user.department_description || user.college_description) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Affiliation:</span>
                    <span>
                      {[user.department_description, user.college_description]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Last Login:</span>
                  <span>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                  </span>
                </div>
              </CardDescription>
              <CardAction>
                {user.mnumber === null && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                  >
                    Action Required
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter>
              <UserModal userId={user.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
