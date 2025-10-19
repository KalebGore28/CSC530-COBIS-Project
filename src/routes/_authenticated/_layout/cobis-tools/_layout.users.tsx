import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import fuzzysort from 'fuzzysort';
import { useState } from 'react';
import { Modal } from '@/components/ui/custom/modal';
import { CollegeSearchBox } from '@/components/search/college-search';
import { DepartmentSearchBox } from '@/components/search/department-search';
import { FacultySearchBox } from '@/components/search/faculty-search';
import { useSession } from '@/components/provider/session';

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const usersQuery = graphql(`
  query usersQuery {
    user {
      id
      mnumber
      name
      email
      emailVerified
      image
      createdAt
      updatedAt
      isEnabled
      lastLogin
      faculty {
        college {
          code
          description
        }
        department {
          code
          description
        }
      }
      roles {
        role {
          id
          name
        }
      }
    }
  }
`);

function fuzzySearchUsers(users: any[], searchTerm: string) {
  if (!searchTerm) return users;
  const options = {
    keys: ['name', 'mnumber', 'email'],
    threshold: -10000, // Adjust this value to control the fuzziness
  };
  // @ts-ignore
  return fuzzysort.go(searchTerm, users, options).map(result => result.obj);
}

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
  const [selectedUser, setSelectedUser] = useState(null);

  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: async () => execute(usersQuery),
  });

  const filteredUsers = fuzzySearchUsers(data?.user ?? [], query);

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
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedUser(user);
                setModalOpen(true);
              }}>
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        title="Provision User"
        description="Fill in the details to provision this user."
        size="xl"
      >
        <div className="flex flex-col p-4 w-full h-[600px]">
          <div className="flex-1 overflow-y-auto space-y-8">
            <span className="font-medium">Faculty:</span>
            <FacultySearchBox
              mnumber={selectedUser?.mnumber}
            />
            <span className="font-medium">Department:</span>
            <DepartmentSearchBox
              departmentCode={selectedUser?.faculty?.department?.code}
            />
            <span className="font-medium">College:</span>
            <CollegeSearchBox
              collegeCode={selectedUser?.faculty?.college?.code}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
