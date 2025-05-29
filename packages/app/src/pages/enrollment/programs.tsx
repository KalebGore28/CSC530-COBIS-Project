// pages/enrollment/programs.tsx
import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

	return (
		<div className="space-y-4">

		</div>
	);
};
