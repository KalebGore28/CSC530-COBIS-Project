import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from '@tanstack/react-router';

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';



// Custom skeleton for TermHistoryTable
function TermHistoryTableSkeleton() {
  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Term</TableHead>
            <TableHead className="w-1/4">Total Courses</TableHead>
            <TableHead className="w-1/4">Total Students</TableHead>
            <TableHead className="w-1/4">Total Credit Hours</TableHead>
            <TableHead className="w-1/4">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-6 w-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const termHistoryQuery = graphql(`
  query termHistoryQuery($mnumber: String!) {
    facultySingle(where: { mnumber: { eq: $mnumber }}) {
      mnumber
      courses_taught {
				total_credit_hours
				total_students
				year
        term_code
				term {
					code
					description
				}
			}

    }
  }
`);

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/_layout/term-history',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber' })
  const mnumber = params.mnumber!
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['termHistory', mnumber],
    queryFn: () => execute(termHistoryQuery, { mnumber }),
  });

  if (isLoading) return <TermHistoryTableSkeleton />;

  const coursesTaught = data?.facultySingle?.courses_taught || [];

  if (coursesTaught.length === 0) {
    return <div>No term history available.</div>;
  }

  // Aggregate data by term and year
  const termYearMap: Record<string, { year: number; term: { code: string; description: string }; totalCourses: number; totalStudents: number; totalCreditHours: number }> = {};

  coursesTaught.forEach(course => {
    const key = `${course?.year}-${course?.term.code}`;
    if (!termYearMap[key]) {
      termYearMap[key] = {
        year: course?.year || 0,
        term: course?.term || { code: '', description: '' },
        totalCourses: 0,
        totalStudents: 0,
        totalCreditHours: 0,
      };
    }
    termYearMap[key].totalCourses += 1;
    termYearMap[key].totalStudents += course?.total_students || 0;
    termYearMap[key].totalCreditHours += course?.total_credit_hours || 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Term History</CardTitle>
        <CardDescription>
          {/* {getCurrentYearTerm.term.description} {getCurrentYearTerm.year} */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[120px] truncate">Term</TableHead>
                <TableHead className="max-w-[120px] truncate">Courses</TableHead>
                <TableHead className="max-w-[120px] truncate">Students</TableHead>
                <TableHead className="max-w-[120px] truncate">Credit Hours</TableHead>
                <TableHead className="max-w-[120px] truncate">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(termYearMap).map(({ year, term, totalCourses, totalStudents, totalCreditHours }) => (
                <TableRow key={`${year}-${term.code}`}>
                  <TableCell className='max-w-[120px] truncate'>{`${term.description} ${year}`}</TableCell>
                  <TableCell className='max-w-[120px] truncate'>{totalCourses}</TableCell>
                  <TableCell className='max-w-[120px] truncate'>{totalStudents}</TableCell>
                  <TableCell className='max-w-[120px] truncate'>{totalCreditHours}</TableCell>
                  <TableCell className='max-w-[120px] truncate'>
                    <Button
                      variant="outline"
                      onClick={() => navigate({ to: `/instructors/${mnumber}/term-history/${year}${term.code}` })}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
