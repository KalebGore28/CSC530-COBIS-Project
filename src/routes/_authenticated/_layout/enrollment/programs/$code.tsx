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

const detailsProgramQuery = graphql(`
  query detailsProgramQuery($code: String!, $startYear: Int!, $endTerm: String!, $endYear: Int!, $startTerm: String!) {
    programsSingle(where: { code: { eq: $code } }) {
      code
      has_concentration
      is_aacsb
      is_discontinued
      is_major
      is_minor
      description
      cip_code
      last_updated
      department {
        code
        description
      }
      college {
        code
        description
      }
			student_programs(startYear: $startYear, endTerm: $endTerm, endYear: $endYear, startTerm: $startTerm) {
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
  '/_authenticated/_layout/enrollment/programs/$code',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/enrollment/programs/$code' })
  const navigate = useNavigate()
  const programCode = params.code!

  const [termRange, setTermRange] = useState<TermRange | null>(null)

  const { data: currentYearTermData } = useQuery({
    queryKey: ['getCurrentYearTerm'],
    queryFn: () => execute(getCurrentYearTermQuery),
  })

  const currentYearTerm = currentYearTermData?.getCurrentYearTerm ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['detailsProgram', programCode, termRange, currentYearTerm],
    queryFn: () => {
      const fallbackYear = currentYearTerm?.year ?? new Date().getFullYear();

      return execute(detailsProgramQuery, {
        code: programCode,
        startYear: termRange?.startYear ?? fallbackYear - 1,
        startTerm: termRange?.startTerm ?? "10",
        endYear: termRange?.endYear ?? fallbackYear,
        endTerm: termRange?.endTerm ?? "90",
      });
    },
    enabled: !!programCode && !!currentYearTerm && !!termRange,
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
            to: `/enrollment/programs`
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Programs
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
          {data?.programsSingle && (
            <EnrollmentTrends
              enrollments={data.programsSingle.student_programs as Enrollment[]}
              title={`Enrollments for Program ${data.programsSingle.code}`}
              description={data.programsSingle.description || undefined}
            />
          )}
        </>
      )}
    </div>
  )
}
