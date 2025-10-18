import { createFileRoute } from '@tanstack/react-router'
import { Outlet, useNavigate, useParams, useLocation } from '@tanstack/react-router'
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const getInstructorQuery = graphql(`
  query getInstructorQuery($mnumber: String!) {
    facultySingle(where: { mnumber: { eq: $mnumber } }) {
      mnumber
      first_name
      last_name
      department_code
      college_code
      department {
        description
      }
      college{
        description
      }
      user{
        image
        email
      }
    }
  }
`);

// Custom skeleton for InstructorPage
function InstructorPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    );
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
};

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber' })
    const navigate = useNavigate()
    const location = useLocation()

    const mnumber = params.mnumber!
    const activeTab = location.pathname.split("/").pop() || "current-term";

    const { data, isLoading } = useQuery({
        queryKey: ['getInstructorQuery', mnumber],
        queryFn: async () => await execute(getInstructorQuery, { mnumber }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) return <InstructorPageSkeleton />;

    const instructor = data?.facultySingle;

    if (!instructor) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <p className="text-muted-foreground">Instructor not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-6 space-y-6'>
            {/* Profile picture and info */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage src={instructor.user?.image || undefined} alt={instructor.first_name} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(`${instructor.first_name} ${instructor.last_name}`)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold">{`${instructor.first_name} ${instructor.last_name}`}</h1>
                            <p className="text-sm text-muted-foreground">Department: {instructor.department?.description}</p>
                            <p className="text-sm text-muted-foreground">College: {instructor.college?.description}</p>
                            <span className="inline-flex items-center text-sm space-x-1">
                                {instructor.user?.email && (
                                    <a
                                        href={`mailto:${instructor.user.email}`}
                                        className="hover:underline"
                                    >
                                        <span>{instructor.user?.email}</span>
                                    </a>
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className='w-full flex justify-center'>
            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    navigate({
                        to: `/instructors/$mnumber/${value}`,
                        params: { mnumber },
                    });
                }}
                className="bg-background border rounded-lg"
            >
                <TabsList className="grid grid-cols-3">
                    <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' value="current-term">Current Term</TabsTrigger>
                    <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' value="term-history">Teaching History</TabsTrigger>
                    <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' value="grade-distribution">Grade Distributions</TabsTrigger>
                </TabsList>
            </Tabs>
            </div>

            {/* Nested routes render here */}
            <Outlet />
        </div>
    );
}
