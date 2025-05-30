import React, { Suspense, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useSetBreadcrumb } from '@/context/breadcrumb';


// GraphQL imports
import { graphql, useLazyLoadQuery } from 'react-relay';


export const ProgramDetails: React.FC = () => {
	const navigate = useNavigate();
	const { programCode } = useParams<{ programCode: string }>();

	return (
		<div className="w-full p-6 mx-auto space-y-6">
			<Button
				variant="outline"
				size="sm"
				className="w-fit"
				onClick={() => navigate(`/enrollment/programs`)}
			>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Programs
			</Button>
			<Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
				<ProgramDetailsContent programCode={programCode} />
			</Suspense>
		</div>
	)
}

const ProgramDetailsContent: React.FC<{ programCode?: string }> = ({
	programCode = '',
}) => {
	useSetBreadcrumb(
		programCode as string,
		`program_description`
	);

	// temp card content
	return (
		<div className="p-4">
			<Card>
				<CardHeader>
					<CardTitle>Program Details</CardTitle>
					<CardDescription>
						Details for program <strong>{programCode}</strong>
					</CardDescription>
					<CardContent>
						<p>Details about the selected program will be displayed here.</p>
					</CardContent>
				</CardHeader>
				<CardContent>
					<p>Program details content will be implemented here.</p>
				</CardContent>
			</Card>
		</div>
	);
}