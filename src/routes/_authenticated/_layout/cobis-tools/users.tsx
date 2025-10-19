import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from '@/components/ui/input';
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
  '/_authenticated/_layout/cobis-tools/users',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_layout/cobis-tools/users"!</div>
}
