import React, { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useSetBreadcrumb } from '@/context/breadcrumb';
import { Badge } from "@/components/ui/badge";

import { AgeHistogram } from '@/components/program/age-histogram';
import { type StudentDatum, GenderCitizenship } from '@/components/program/gender-citizenship-chart';
import { type TermRange, TermRangeSelector, TermRangeSelectorSkeleton } from '@/components/selectors/term-range-selector';
import { type Enrollment, EnrollmentTrends } from '@/components/program/enrollment-trends';

// GraphQL imports
import type { detailsStudentProgramsQuery } from './__generated__/detailsStudentProgramsQuery.graphql';
import type { detailsCurrentTermQuery } from './__generated__/detailsCurrentTermQuery.graphql';
import type { detailsQuery } from './__generated__/detailsQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const detailsCurrentTermQuery = graphql`
	query detailsCurrentTermQuery {
		getCurrentYearTerm {
			year
			term {
				code
				description
			}
		}
	}
`;

const detailsQuery = graphql`
	query detailsQuery($code: String!) {
		program(code: $code) {
			code
			department {
				code
				description
			}
			has_concentration
			is_aacsb
			is_discontinued
			is_major
			is_minor
			description
			cip_code
			added_on
			college {
				code
				description
			}
		}
	}
`;

const detailsStudentProgramsQuery = graphql`
	query detailsStudentProgramsQuery($code: String!, $startYear: Int!, $endTerm: String!, $endYear: Int!, $startTerm: String!) {
		program(code: $code) {
			student_programs(startYear: $startYear, endTerm: $endTerm, endYear: $endYear, startTerm: $startTerm) {
				student {
					age
					citizenship
					gender
				}
				term {
					code
					description
				}
				year
			}
		}
	}
`;

const ProgramDetailsHeaderSkeleton: React.FC = () => (
	<Card className="w-full col-span-2">
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
	const [termRange, setTermRange] = useState<TermRange | null>(null);

	if (!programCode) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Program Not Found</CardTitle>
					<CardDescription>
						The program code is missing or invalid.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

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
			<div className="grid grid-cols-2 gap-4">
				<Suspense fallback={<ProgramDetailsHeaderSkeleton />}>
					<ProgramDetailsHeader programCode={programCode} />
				</Suspense>
				<Suspense fallback={<TermRangeSelectorSkeleton />}>
					<ProgramDetailsTermRangeSelector onChange={(range) => setTermRange(range)} />
				</Suspense>

				{termRange && (
					<Suspense fallback={
						<div className="col-span-2 space-y-4">
							<Skeleton className="h-64 w-full" />
							<Skeleton className="h-64 w-full" />
						</div>
					}>
						<ProgramDetailsContent programCode={programCode} termRange={termRange} />
					</Suspense>
				)}
			</div>
		</div>
	)
}

const ProgramDetailsHeader: React.FC<{ programCode: string }> = ({ programCode }) => {
	const data = useLazyLoadQuery<detailsQuery>(
		detailsQuery,
		{ code: programCode },
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
	);
}

const ProgramDetailsTermRangeSelector: React.FC<{ onChange: (range: TermRange) => void }> = ({ onChange }) => {
	const { getCurrentYearTerm } = useLazyLoadQuery<detailsCurrentTermQuery>(
		detailsCurrentTermQuery,
		{},
		{ fetchPolicy: "store-or-network" }
	);

	useEffect(() => {
		if (getCurrentYearTerm) {
			onChange({
				startYear: getCurrentYearTerm.year,
				startTerm: '10', // Spring
				endYear: getCurrentYearTerm.year,
				endTerm: '90', // Winter
			});
		}
	}, [getCurrentYearTerm]);

	return (
		<TermRangeSelector
			years={Array.from(
				{ length: 10 },
				(_, i) => getCurrentYearTerm.year - i
			)}
			onChange={(range: TermRange) => onChange(range)}
			defaultValue={{
				startYear: getCurrentYearTerm.year,
				startTerm: '10', // Spring
				endYear: getCurrentYearTerm.year,
				endTerm: '90', // Winter
			}}
		/>
	);
}

const ProgramDetailsContent: React.FC<{ programCode: string, termRange: TermRange }> = ({ programCode, termRange }) => {
	const data = useLazyLoadQuery<detailsStudentProgramsQuery>(
		detailsStudentProgramsQuery,
		{
			code: programCode,
			startYear: termRange.startYear,
			startTerm: termRange.startTerm,
			endYear: termRange.endYear,
			endTerm: termRange.endTerm,
		},
		{ fetchPolicy: "store-or-network" }
	);

	if (!data.program) {
		return null;
	}

	const ages: number[] = data.program.student_programs.map(
		(sp) => sp.student.age
	);

	const genderCitizenship: StudentDatum[] = data.program.student_programs.map(
		(sp) => ({
			citizenship: sp.student.citizenship as 'US' | 'International',
			gender: sp.student.gender as 'M' | 'F',
		})
	);

	const enrollments: Enrollment[] = data.program.student_programs.map(
		(sp) => ({
			year: sp.year,
			term: {
				code: sp.term.code as '10' | '50' | '80' | '90',
				description: sp.term.description,
			},
		})
	);

	return (
		<>
			<EnrollmentTrends
				enrollments={enrollments}
				title="Enrollment Trends"
				className='col-span-2'
			/>


			<AgeHistogram
				data={ages}
				className='col-span-2 md:col-span-1'
				binSize={5}
			/>

			<GenderCitizenship
				data={genderCitizenship}
				className='col-span-2 md:col-span-1'
			/>
		</>
	);
}