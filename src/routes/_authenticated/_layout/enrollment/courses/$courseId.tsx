import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { type Enrollment, EnrollmentTrends } from '@/components/charts/enrollment-trends';
import { type TermRange, TermRangeSelector } from '@/components/selectors/term-range-selector';

// GraphQL imports
import { useQuery } from '@tanstack/react-query'
import { execute } from '@/graphql/execute'
import { graphql } from '@/graphql'

const getCurrentYearTermQuery = graphql(`
  query getCurrentYearTermQuery {
    getCurrentYearTerm {
      year
      term
      term_code
    }
  }
`)

const detailsCourseQuery = graphql(`
  query detailsCourseQuery(
    $subject: String!
    $number: Int!
    $suffix: String!
    $startYear: Int!
    $endTerm: String!
    $endYear: Int!
    $startTerm: String!
  ) {
    coursesSingle(
      where: {
        subject: { eq: $subject }
        number: { eq: $number }
        suffix: { eq: $suffix }
      }
    ) {
      subject
      number
      suffix
      title
      hours
      last_updated
      student_courses(
        startYear: $startYear
        endTerm: $endTerm
        endYear: $endYear
        startTerm: $startTerm
      ) {
        # student {
        # 	citizenship
        # 	gender
        # }
        term {
          code
          description
        }
        year
      }
    }
  }
`);

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/courses/$courseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/enrollment/courses/$courseId' })
  const navigate = useNavigate()
  const courseId = params.courseId!

  const [termRange, setTermRange] = useState<TermRange | null>(null)

  const { data: currentYearTermData } = useQuery({
    queryKey: ['getCurrentYearTerm'],
    queryFn: () => execute(getCurrentYearTermQuery),
  })

  const currentYearTerm = currentYearTermData?.getCurrentYearTerm || null

  const { data, isLoading } = useQuery({
    queryKey: ['detailsCourse', courseId, termRange, currentYearTerm],
    queryFn: () => {
      // Parse courseId like "ACC100T" → { subject: "ACC", number: 100, suffix: "T" }
      const match = courseId.match(/^([A-Za-z]+)(\d+)([A-Za-z]*)$/);
      const subject = match?.[1] ?? '';
      const number = match?.[2] ? Number(match[2]) : 0;
      const suffix = match?.[3] ?? '';

      const fallbackYear = currentYearTerm?.year ?? new Date().getFullYear();

      return execute(detailsCourseQuery, {
        subject,
        number,
        suffix,
        startYear: termRange?.startYear ?? fallbackYear - 4,
        startTerm: termRange?.startTerm ?? '10',
        endYear: termRange?.endYear ?? fallbackYear,
        endTerm: termRange?.endTerm ?? '90',
      });
    },
    enabled: !!courseId && !!currentYearTerm && !!termRange,
  });

  if (!currentYearTerm) return null;


  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="flex flex-col">
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => navigate({
            to: `/enrollment/courses`
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
      <TermRangeSelector
        years={Array.from({ length: 10 }, (_, i) => currentYearTerm!.year! - 9 + i)}
        onChange={setTermRange}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Data Available */}
          {data?.coursesSingle && (
            <EnrollmentTrends
              enrollments={data.coursesSingle.student_courses as Enrollment[]}
              title={`Enrollments for Course ${data.coursesSingle.subject} ${data.coursesSingle.number}${data.coursesSingle.suffix}`}
              description={data.coursesSingle.title || undefined}
            />
          )}
        </>
      )}
    </div>
  )
}
