import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

function SelectedTermTableSkeleton() {
  return (
    <Card className='p-4 px-0'>
      <CardHeader>
        <CardTitle>Current Term Courses</CardTitle>
        <CardDescription>
          {/* {getCurrentYearTerm.term.description} {getCurrentYearTerm.year} */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Course</TableHead>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead className="w-[100px]">Credit Hours</TableHead>
              <TableHead className="w-[100px]">Total Students</TableHead>
              <TableHead className="w-[100px]">Total Credit Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const getCurrentYearTermQuery = graphql(`
	query getCurrentYearTermQuery {
		getCurrentYearTerm {
			year
			term
			term_code
		}
	}
`);

const courseTermQuery = graphql(`
  query courseTermQuery($mnumber: String!, $startTerm: String, $startYear: Int, $endTerm: String, $endYear: Int) {
    facultySingle(where: { mnumber: { eq: $mnumber }}) {
      mnumber
      courses_taught(startTerm: $startTerm, startYear: $startYear, endTerm: $endTerm, endYear: $endYear) {
				course {
					title
					subject
					number
					suffix
				}
				credit_hour
				course_section
				total_students
				total_credit_hours
			}
    }
  }
`);

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/_layout/current-term',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber' })
  const mnumber = params.mnumber!
  const navigate = useNavigate();

  const { data: getCurrentYearTermData, isLoading: isGetCurrentYearTermLoading } = useQuery({
    queryKey: ['getCurrentYearTerm'],
    queryFn: () => execute(getCurrentYearTermQuery),
  });

  const getCurrentYearTerm = getCurrentYearTermData?.getCurrentYearTerm;

  const { data: courseTermData, isLoading: isCourseTermLoading } = useQuery({
    queryKey: ['courseTerm', mnumber, getCurrentYearTerm],
    queryFn: () => execute(courseTermQuery, {
      mnumber,
      startTerm: '10',
      startYear: 2024,
      endTerm: getCurrentYearTerm?.term_code,
      endYear: getCurrentYearTerm?.year,
    }),
    enabled: !!getCurrentYearTerm,
  });

  const coursesTaught = courseTermData?.facultySingle?.courses_taught || [];

  if (isGetCurrentYearTermLoading || isCourseTermLoading) return <SelectedTermTableSkeleton />;

  if (!getCurrentYearTerm) return <div>No current term data available.</div>;

  if (coursesTaught.length === 0) {
    console.log(getCurrentYearTerm);
    return (
      <div className='border rounded-lg'>
        <p className='p-4 text-center text-muted-foreground'>
          No courses taught in the current term.
        </p>
      </div>
    );
  }

  return (
    <Card className='p-4 px-0'>
      <CardHeader>
        <CardTitle>Current Term Courses</CardTitle>
        <CardDescription>
          {/* {getCurrentYearTerm.term.description} {getCurrentYearTerm.year} */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='max-w-[100px] truncate'>Course</TableHead>
                <TableHead className='max-w-[100px] truncate'>Title</TableHead>
                <TableHead className='max-w-[100px] truncate'>Students</TableHead>
                <TableHead className='max-w-[100px] truncate'>Credit Hours</TableHead>
                <TableHead className='max-w-[100px] truncate'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesTaught.map((instructorCourse) => (
                <TableRow key={instructorCourse?.course_section}>
                  <TableCell className='max-w-[100px] truncate'>
                    {`${instructorCourse?.course.subject} ${instructorCourse?.course.number}${instructorCourse?.course.suffix}`}
                  </TableCell>
                  <TableCell className='max-w-[100px] truncate'>{instructorCourse?.course.title}</TableCell>
                  <TableCell className='max-w-[100px] truncate'>{instructorCourse?.total_students}</TableCell>
                  <TableCell className='max-w-[100px] truncate'>{instructorCourse?.total_credit_hours}</TableCell>
                  <TableCell className='max-w-[100px] truncate'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        navigate({
                          to: `/instructors/${mnumber}/term-history/${getCurrentYearTerm?.year}${getCurrentYearTerm?.term_code}/${instructorCourse?.course.subject}${instructorCourse?.course.number}${instructorCourse?.course.suffix}-${instructorCourse?.course_section}`
                        });
                      }}
                    >
                      View Roster
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
