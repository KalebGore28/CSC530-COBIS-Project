// pages/enrollment/programs.tsx
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgramMetrics } from '@/fragments/program-metrics';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { programsQuery } from './__generated__/programsQuery.graphql';

export const ProgramsPage: React.FC = () => (
	<div className="p-4">
		<Card>
			<CardHeader>
				<CardTitle>Programs Management</CardTitle>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
					<ProgramMetricsContent />
				</Suspense>
			</CardContent>
		</Card>
	</div>
);

const ProgramMetricsContent: React.FC = () => {
	const data = useLazyLoadQuery<programsQuery>(
		graphql`
      query programsQuery($first: Int!, $after: String) {
        programs {
          code
          description
          ...programMetrics @arguments(first: $first, after: $after)
        }
      }
    `,
		{ first: 5, after: null },
		{ fetchPolicy: 'store-or-network' }
	);

	return (
		<div className="space-y-4">
			{data.programs.map(program => (
				<ProgramMetrics key={program.code} program={program} />
			))}
		</div>
	);
};
