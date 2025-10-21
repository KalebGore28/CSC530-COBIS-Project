import { createFileRoute } from '@tanstack/react-router'
import { AdvisedStudents } from '@/components/advised-students'
import { useSession } from '@/components/provider/session'

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

export const Route = createFileRoute('/_authenticated/_layout/advisor-page')({
  component: RouteComponent,
})

const getCurrentYearTermQuery = graphql(`
	query getCurrentYearTermQuery {
		getCurrentYearTerm {
			year
			term
			term_code
		}
	}
`);

function RouteComponent() {
  const { session } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ['getCurrentYearTermQuery'],
    queryFn: async () => await execute(getCurrentYearTermQuery),
  });

  if (!session || !session.mnumber || isLoading) return null;

  if (!data?.getCurrentYearTerm) {
    return <div>No current term information available.</div>
  }

  return <div>
    <div className="mx-auto p-6 w-full">
      <AdvisedStudents
        mnumber={session.mnumber}
        term_info={data?.getCurrentYearTerm!}
        title='My Advised Students'
        modalOpen={true}
      />
    </div>
  </div>
}