import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import fuzzysort from 'fuzzysort';
import { useState } from 'react';
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
                  <div className="text-sm text-gray-500">Last Login: {user.lastLogin}</div>
                </div>
              </div>

              <Button variant="outline" size="sm">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
