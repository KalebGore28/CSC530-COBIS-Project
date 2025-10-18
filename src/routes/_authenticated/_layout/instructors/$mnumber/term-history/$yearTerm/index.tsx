import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { CourseGradeChart } from '@/components/charts/course-grade-distributions';
import { AdvisedStudents } from '@/components/advised-students';
import { ArrowLeft, BookOpen, Users, Calculator } from 'lucide-react';

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const termMappings: Record<string, string> = {
  '10': 'Spring',
  '50': 'Summer',
  '80': 'Fall',
  '90': 'Winter'
};

const termDetailsQuery = graphql(`
  query termDetailsQuery(
    $mnumber: String!
    $startTerm: String
    $startYear: Int
    $endTerm: String
    $endYear: Int
  ) {
    facultySingle(where: { mnumber: { eq: $mnumber } }) {
      courses_taught(
        startTerm: $startTerm
        startYear: $startYear
        endTerm: $endTerm
        endYear: $endYear
      ) {
        course {
					title
					subject
					number
					suffix
				}
        course_section
        total_credit_hours
        total_students
      }
    }
  }
`)

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/' })
  const mnumber = params.mnumber!
  const yearTerm = params.yearTerm!
  const navigate = useNavigate();

  const termCode = yearTerm?.slice(-2);
  const year = parseInt(yearTerm?.slice(0, 4) || '0', 10);

  const { data } = useQuery({
    queryKey: ['termDetails', mnumber, termCode, year],
    queryFn: () => execute(termDetailsQuery, {
      mnumber,
      startTerm: termCode,
      startYear: year,
      endTerm: termCode,
      endYear: year,
    }),
  });

  const termDetailsData = data?.facultySingle?.courses_taught || [];

  const summary = termDetailsData.reduce((acc, course) => {
    acc.totalStudents += course?.total_students || 0;
    acc.totalCreditHours += course?.total_credit_hours || 0;
    return acc;
  }, { totalStudents: 0, totalCreditHours: 0 });

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Statistics summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="w-full col-span-3">
          {/* Back button */}
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => navigate({
              to: `/instructors/${mnumber}/term-history`
            })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Term History
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses</p>
                <p className="text-3xl font-bold">{termDetailsData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <p className="text-3xl font-bold">{summary.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credit Hours</p>
                <p className="text-3xl font-bold">{summary.totalCreditHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course details table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            {termDetailsData.length} course{termDetailsData.length !== 1 ? 's' : ''} taught in {termMappings[termCode!]} {year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='border rounded-lg'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='max-w-[120px] truncate'>Course</TableHead>
                  <TableHead className='max-w-[120px] truncate'>Title</TableHead>
                  <TableHead className='max-w-[120px] truncate'>Students</TableHead>
                  <TableHead className='max-w-[120px] truncate'>Credit Hours</TableHead>
                  <TableHead className='max-w-[120px] truncate'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {termDetailsData.map((instructorCourse) => (
                  <TableRow key={`${instructorCourse?.course.subject}${instructorCourse?.course.number}${instructorCourse?.course.suffix}-${instructorCourse?.course_section}`}>
                    <TableCell className='max-w-[120px] truncate'>
                      {`${instructorCourse?.course.subject}${instructorCourse?.course.number}${instructorCourse?.course.suffix}-${instructorCourse?.course_section}`}
                    </TableCell>
                    <TableCell className='max-w-[120px] truncate'>{instructorCourse?.course.title}</TableCell>
                    <TableCell className='max-w-[120px] truncate'>{instructorCourse?.total_students}</TableCell>
                    <TableCell className='max-w-[120px] truncate'>{instructorCourse?.total_credit_hours}</TableCell>
                    <TableCell className='max-w-[120px] truncate'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          navigate({
                            to: `/instructors/${mnumber}/term-history/${year}${termCode}/${instructorCourse?.course.subject}${instructorCourse?.course.number}${instructorCourse?.course.suffix}-${instructorCourse?.course_section}`
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

      <CourseGradeChart mnumber={mnumber} term={termCode} year={year} />

      <AdvisedStudents
        mnumber={mnumber}
        term_info={{ term_code: termCode!, year: year!, term: termMappings[termCode!] }}
        title='My Advised Students'
        modalOpen={false}
      />
    </div>
  )
}
