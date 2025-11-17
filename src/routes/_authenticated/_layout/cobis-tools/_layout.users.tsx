import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

import { usersCollection } from '@/collections/users';
import { facultyCollection } from '@/collections/faculty';
import { departmentsCollection } from '@/collections/departments';
import { collegesCollection } from '@/collections/colleges';
import { useLiveQuery, ilike, or, eq } from '@tanstack/react-db';

import { UserCard } from '@/components/user-card';

const getInitials = (name: string | null | undefined): string => {
  if (!name) {
    return '??';
  }
  return name
    .split(' ')
    .map(n => (n && n[0] ? n[0] : ''))
    .join('')
    .toUpperCase();
}

export const Route = createFileRoute(
  '/_authenticated/_layout/cobis-tools/_layout/users',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: filteredUsers, isLoading } = useLiveQuery((q) =>
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
      .where(({ users }) =>
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.mnumber, `%${query}%`),
          ilike(users.email, `%${query}%`)
        )
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
    [query] // Re-run when query changes
  );

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-3xl mx-auto">
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

      <div className="w-full max-w-3xl mx-auto space-y-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
                  {getInitials(user.name)}
                </div>
                <div>
                  <div className="font-medium flex items-center space-x-2">
                    <span>{user.name}</span>
                    <Badge variant={user.isEnabled ? "default" : "destructive"}>
                      {user.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-sm text-gray-500">M#: {user.mnumber}</div>
                  <div className="text-xs text-gray-500">Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedUser(user.id);
                setModalOpen(true);
              }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      {selectedUser && (
        <UserCard
          userId={selectedUser}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      )}

    </div>
  )
}
