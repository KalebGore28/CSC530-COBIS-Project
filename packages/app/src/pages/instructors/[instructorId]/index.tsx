import React, { Suspense } from 'react';
import { useSetBreadcrumb } from '@/context/breadcrumb';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectedTermTable } from '@/components/instructor/selected-term-table';
import { TermHistoryTable } from '@/components/instructor/term-history-table';
import { GradeDistribution } from '@/components/charts/term-grade-distributions';

// GraphQL imports
import type { InstructorIdGetCurrentTermQuery } from "./__generated__/InstructorIdGetCurrentTermQuery.graphql";
import type { InstructorIdQuery } from "./__generated__/InstructorIdQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const InstructorIdGetCurrentTermQuery = graphql`
	query InstructorIdGetCurrentTermQuery {
		getCurrentYearTerm {
			year
			term {
				code
				description
			}
		}
	}
`;

const InstructorIdQuery = graphql`
	query InstructorIdQuery($mnumber: String!) {
		instructor(mnumber: $mnumber) {
			first_name
			last_name
			college {
				code
				description
			}
			department {
				code
				description
			}
			user {
				email
				image
			}
		}
	}
`;

// Custom skeleton for InstructorPage
const InstructorPageSkeleton: React.FC = () => (
	<Card>
		<CardHeader>
			<Skeleton className="h-6 w-1/2" />
			<Skeleton className="h-4 w-1/3" />
		</CardHeader>
		<CardContent>
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-full" />
		</CardContent>
	</Card>
)

// Helper function to get initials from name
const getInitials = (name: string): string => {
	return name
		.split(' ')
		.map(part => part.charAt(0))
		.join('')
		.toUpperCase();
};

export const InstructorPage: React.FC = () => {
	return (
		<div className="w-full p-6 mx-auto space-y-6">
			<Suspense fallback={<InstructorPageSkeleton />}>
				<InstructorPageContent />
			</Suspense>
		</div>
	);

}

const InstructorPageContent: React.FC = () => {
	const { mnumber } = useParams();

	const { getCurrentYearTerm } = useLazyLoadQuery<InstructorIdGetCurrentTermQuery>(
		InstructorIdGetCurrentTermQuery,
		{},
		{ fetchPolicy: "store-or-network" }
	);

	const { instructor } = useLazyLoadQuery<InstructorIdQuery>(
		InstructorIdQuery,
		{ mnumber: mnumber as string },
		{ fetchPolicy: "store-or-network" }
	);

	if (!instructor) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center gap-2">
					<AlertCircle className="h-8 w-8 text-red-500" />
					<p className="text-muted-foreground">Instructor not found</p>
				</div>
			</div>
		);
	}

	useSetBreadcrumb(
		mnumber as string,
		instructor?.first_name + " " + instructor?.last_name,
	);

	return (
		<div>
			{/* Profile picture and info */}
			<Card>
				<CardContent>
					<div className="flex items-center gap-4">
						<Avatar className="h-24 w-24 border-2 border-primary">
							<AvatarImage src={instructor.user?.image || undefined} alt={instructor.first_name} />
							<AvatarFallback className="text-2xl">
								{getInitials(`${instructor.first_name} ${instructor.last_name}`)}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="text-3xl font-bold">{`${instructor.first_name} ${instructor.last_name}`}</h1>
							<p className="text-xl text-muted-foreground">{instructor.department?.description}</p>
							<p className="text-sm text-muted-foreground">{instructor.college?.description}</p>
							<span className="inline-flex items-center text-sm space-x-1">
								{instructor.user?.email && (
									<a
										href={`mailto:${instructor.user.email}`}
										className="hover:underline"
									>
										<span>{instructor.user?.email}</span>
									</a>
								)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="current" className="w-full mt-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="current">Current Term</TabsTrigger>
					<TabsTrigger value="history">Teaching History</TabsTrigger>
					<TabsTrigger value="grade-distributions">Grade Distributions</TabsTrigger>
				</TabsList>

				{/* Current Term Tab */}
				<TabsContent value="current">
					<Card>
						<CardHeader>
							<CardTitle>Current Term</CardTitle>
							<CardDescription>
								{getCurrentYearTerm.term.description} {getCurrentYearTerm.year}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SelectedTermTable
								mnumber={mnumber as string}
								startTerm={getCurrentYearTerm.term.code}
								startYear={getCurrentYearTerm.year}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Teaching History Tab */}
				<TabsContent value="history">
					<Card>
						<CardHeader>
							<CardTitle>Teaching History</CardTitle>
							<CardDescription>Summary of courses taught across terms</CardDescription>
						</CardHeader>
						<CardContent>
							<TermHistoryTable mnumber={mnumber as string} />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Grade Distributions Tab */}
				<TabsContent value="grade-distributions">
					<GradeDistribution
						mnumber={mnumber as string}
						title={`${instructor.first_name} ${instructor.last_name}'s Grade Distributions`}
						description={`Showing grade distribution trends over time for ${instructor.first_name} ${instructor.last_name}`}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}