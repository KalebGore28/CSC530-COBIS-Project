import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useSetBreadcrumb } from '@/context/breadcrumb';
import { Badge } from "@/components/ui/badge";

import { AgeHistogram } from '@/components/program/age-histogram';
import { type StudentDatum, GenderEthnicity } from '@/components/program/gender-ethnicity-chart';

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

	const ages: number[] = [
		27, 15, 19, 24, 17, 22, 23, 18, 15, 23,
		27, 19, 20, 30, 19, 19, 34, 14, 26, 12,
		19, 30, 28, 17, 20, 22, 16, 25, 33, 15,
		12, 23, 21, 31, 21, 22, 21, 17, 25, 15,
		28, 22, 25, 19, 17, 31, 24, 28, 23, 35,
		24, 17, 26, 24, 10, 21, 27, 26, 20, 16,
		24, 16, 29, 20, 17, 19, 18, 19, 18, 20,
		23, 25, 16, 17, 20, 22, 22, 12, 31, 18,
		31, 15, 17, 21, 21, 18, 26, 13, 27, 18,
		28, 20, 15, 24, 33, 22, 23, 20, 18, 18,
		15, 15, 22, 30, 25, 24, 23, 18, 23, 20,
		27, 28, 28, 24, 27, 19, 22, 21, 17, 17,
		18, 20, 12, 32, 23, 22, 25, 21, 24, 24,
		26, 11, 27, 23, 25, 24, 23, 29, 20, 25,
		21, 22, 34, 31, 23, 26, 21, 13, 25, 21,
		16, 10, 29, 25, 25, 18, 22, 29, 19, 23,
		17, 23, 17, 19, 20, 26, 24, 19, 21, 22,
		22, 17, 26, 23, 23, 34, 20, 25, 14, 31,
		17, 17, 21, 17, 16, 26, 25, 22, 20, 25,
		19, 18, 27, 17, 18, 25, 20, 17, 21, 21,
	];

	const sampleData: StudentDatum[] = [
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "M" },

		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },

		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "F" },

		{ citizenship: "US", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "F" },

		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "US", gender: "F" },

		{ citizenship: "International", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "US", gender: "F" },
		{ citizenship: "International", gender: "F" },
		{ citizenship: "US", gender: "M" },
		{ citizenship: "International", gender: "M" },
		{ citizenship: "US", gender: "F" }
	];

	return (
		<div className="grid grid-cols-2 gap-4">
			{/* Program Details Card */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Program Details</CardTitle>
					<CardDescription>
						Details for program code: ({data.program.code}) : {data.program.description || 'N/A'}
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

			<AgeHistogram
				data={ages}
				className='col-span-2 md:col-span-1'
				binSize={5}
			/>

			<GenderEthnicity
				className='col-span-2 md:col-span-1'
				data={sampleData}
			/>
		</div>
	);
}