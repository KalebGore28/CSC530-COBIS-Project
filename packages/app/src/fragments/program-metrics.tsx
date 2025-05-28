import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { graphql, usePaginationFragment } from 'react-relay';
import type { ProgramMetricsPaginationQuery } from './__generated__/ProgramMetricsPaginationQuery.graphql';
import type { programMetrics$key } from './__generated__/programMetrics.graphql';

interface Props {
  program: programMetrics$key;
}

export const ProgramMetrics: React.FC<Props> = ({ program }) => {
  const {
    data,
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment<ProgramMetricsPaginationQuery, programMetrics$key>(
    graphql`
      fragment programMetrics on Program
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 10 }
        after: { type: "String" }
      )
      @refetchable(queryName: "ProgramMetricsPaginationQuery")
      {
        id
        code
        description
        student_programs(first: $first, after: $after)
          @connection(key: "programMetrics_student_programs") {
          edges {
            cursor
            node {
              mnumber
              year
              term {
                code
                description
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    program
  );

  const edges = data.student_programs.edges ?? [];
  if (edges.length === 0) {
    return null;
  }

  // console.log('hasNext?', hasNext, 'endCursor:', data.student_programs.pageInfo.endCursor);


  return (
    <Card className="space-y-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {data.description} ({data.code})
        </h3>
      </CardHeader>

      <ul className="list-disc pl-5 space-y-1">
        {edges.map(({ node, cursor }) => (
          <li key={`${node?.mnumber}-${cursor}`} className="text-gray-800">
            {node?.mnumber} - {node?.term.description} {node?.year}
          </li>
        ))}
      </ul>

      <Suspense fallback={<p className="italic">Loading more…</p>}>
        {hasNext && (
          <Button
            onClick={() => loadNext(5)}
            disabled={isLoadingNext}
            variant="default"
            className="mt-4"
          >
            {isLoadingNext ? 'Loading…' : 'Load More'}
          </Button>
        )}
      </Suspense>
    </Card>
  );
};
