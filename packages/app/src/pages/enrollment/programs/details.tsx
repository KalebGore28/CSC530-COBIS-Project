import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useSetBreadcrumb } from '@/context/breadcrumb';
import { Badge } from "@/components/ui/badge";

// GraphQL imports
import type { detailsQuery } from './__generated__/detailsQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const detailsQuery = graphql`
	query detailsQuery($programCode: String!) {
		  program(code: $programCode) {
			cip_code
			added_on
			code
			description
			has_concentration
			is_aacsb
			is_discontinued
			is_major
			is_minor
			college {
				code
				description
			}
			department {
				code
				description
			}
		}
	}
`;

export const ProgramDetailsSkeleton: React.FC = () => (
	<Card className="w-full">
		<CardHeader>
			<CardTitle>
				<Skeleton className="h-6 w-1/3" />
			</CardTitle>
			<CardDescription>
				<Skeleton className="h-4 w-1/2" />
			</CardDescription>
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{Array.from({ length: 6 }).map((_, idx) => (
					<div key={idx} className="space-y-1">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				))}
			</div>
			<div className="flex flex-wrap items-center gap-2 pt-2">
				{Array.from({ length: 5 }).map((_, idx) => (
					<Skeleton key={idx} className="h-6 w-20 rounded-md" />
				))}
			</div>
		</CardContent>
	</Card>
);

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
			<Suspense fallback={<ProgramDetailsSkeleton />}>
				<ProgramDetailsContent programCode={programCode} />
			</Suspense>
		</div>
	)
}

const ProgramDetailsContent: React.FC<{ programCode?: string }> = ({
	programCode = '',
}) => {

	const data = useLazyLoadQuery<detailsQuery>(
		detailsQuery,
		{ programCode },
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.program) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Program Not Found</CardTitle>
					<CardDescription>
						The program with code <strong>{programCode}</strong> does not exist.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	useSetBreadcrumb(
		programCode as string,
		data.program.description || 'Program Details',
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Program Details</CardTitle>
				<CardDescription>
					Details for program code: {data.program.code}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<strong>Program Code:</strong> {data.program.code}
					</div>
					<div>
						<strong>Description:</strong> {data.program.description || 'N/A'}
					</div>
					<div>
						<strong>CIP Code:</strong> {data.program.cip_code || 'N/A'}
					</div>
					<div>
						<strong>Added On:</strong>{' '}
						{
							data.program.added_on
								? new Date(data.program.added_on).toLocaleDateString()
								: 'N/A'
						}
					</div>
					<div>
						<strong>College:</strong> {data.program.college?.description || 'N/A'}
					</div>
					<div>
						<strong>Department:</strong> {data.program.department?.description || 'N/A'}
					</div>

					{/* Program Flags */}
					<div className="flex flex-wrap items-center gap-2">
						{data.program.is_major && (
							<Badge
								variant="outline"
								className="text-green-800 border-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900"
							>
								Major
							</Badge>
						)}
						{data.program.is_minor && (
							<Badge
								variant="outline"
								className="text-blue-800 border-blue-800 bg-blue-100 dark:text-blue-100 dark:bg-blue-900"
							>
								Minor
							</Badge>
						)}
						{data.program.has_concentration && (
							<Badge
								variant="outline"
								className="text-purple-800 border-purple-800 bg-purple-100 dark:text-purple-100 dark:bg-purple-900"
							>
								Concentration
							</Badge>
						)}
						{data.program.is_discontinued && (
							<Badge
								variant="outline"
								className="text-red-800 border-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900"
							>
								Discontinued
							</Badge>
						)}
						{data.program.is_aacsb && (
							<Badge
								variant="outline"
								className="text-amber-800 border-amber-800 bg-amber-100 dark:text-amber-100 dark:bg-amber-900"
							>
								AACSB
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}