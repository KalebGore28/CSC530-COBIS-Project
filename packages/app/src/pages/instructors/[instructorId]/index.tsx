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
import { GradeDistribution } from '@/components/charts/term-grade-distributions';
import { CurrentTermTable } from '@/components/instructor/current-term-table';

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
							<CurrentTermTable
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
							<p className="text-sm text-muted-foreground">No teaching history available.</p>
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







// 				{/* Additional Information Tabs */}
// 				<Tabs defaultValue="current" className="w-full">
// 					<TabsList className="grid w-full grid-cols-3">
// 						<TabsTrigger value="current">Current Term</TabsTrigger>
// 						<TabsTrigger value="history">Teaching History</TabsTrigger>
// 						<TabsTrigger value="grade-distributions">Grade Distributions</TabsTrigger>
// 					</TabsList>

// 					{/* Current Term Tab */}
// 					<TabsContent value="current">
// 						<Card>
// 							<CardHeader>
// 								<CardTitle>
// 									{currentTerm ? `Current Term: ${currentTerm.termName} ${currentTerm.year}` : 'Current Term'}
// 								</CardTitle>
// 								<CardDescription>
// 									{loadingCourses ? 'Loading course information...' :
// 										courses.length > 0 ? `Currently teaching ${courses.length} courses` : 'No courses this term'}
// 								</CardDescription>
// 							</CardHeader>
// 							<CardContent>
// 								<div className="space-y-4">
// 									{loadingCourses ? (
// 										<div className="space-y-4">
// 											<div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
// 											<div className="h-48 w-full bg-muted rounded animate-pulse"></div>
// 										</div>
// 									) : courses.length > 0 ? (
// 										<Card>
// 											<CardHeader className="pb-2">
// 												<CardTitle className="text-lg">Current Schedule</CardTitle>
// 											</CardHeader>
// 											<CardContent>
// 												<div className="rounded-md border">
// 													<Table>
// 														<TableHeader>
// 															<TableRow>
// 																<TableHead>Course</TableHead>
// 																<TableHead>Title</TableHead>
// 																<TableHead>CRN</TableHead>
// 																<TableHead>Section</TableHead>
// 																<TableHead>Credit Hours</TableHead>
// 																<TableHead>Students</TableHead>
// 															</TableRow>
// 														</TableHeader>
// 														<TableBody>
// 															{courses.map((course, index) => (
// 																<TableRow key={index}>
// 																	<TableCell className="font-medium">
// 																		{`${course.courseSubject} ${course.courseNumber}${course.courseSuffix}`}
// 																	</TableCell>
// 																	<TableCell>{course.courseTitle}</TableCell>
// 																	<TableCell>{course.crn}</TableCell>
// 																	<TableCell>{course.courseSection}</TableCell>
// 																	<TableCell>{course.creditHours}</TableCell>
// 																	<TableCell>{course.studentCount}</TableCell>
// 																</TableRow>
// 															))}
// 														</TableBody>
// 													</Table>
// 												</div>
// 											</CardContent>
// 										</Card>
// 									) : (
// 										<div className="flex flex-col items-center justify-center py-6 text-center">
// 											<p className="text-muted-foreground mb-2">No courses scheduled for this term.</p>
// 											<p className="text-sm text-muted-foreground">The faculty member is not currently teaching any courses.</p>
// 										</div>
// 									)}
// 								</div>
// 							</CardContent>
// 						</Card>
// 					</TabsContent>

// 					{/* Teaching History Tab */}
// 					<TabsContent value="history">
// 						<Card>
// 							<CardHeader>
// 								<CardTitle>Teaching History</CardTitle>
// 								<CardDescription>
// 									Summary of courses taught across terms
// 								</CardDescription>
// 							</CardHeader>
// 							<CardContent>
// 								{loadingTerms ? (
// 									<div className="space-y-4 py-4">
// 										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
// 										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
// 										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
// 										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
// 									</div>
// 								) : termSummaries.length > 0 ? (
// 									<>
// 										<div className="rounded-md border">
// 											<Table>
// 												<TableHeader>
// 													<TableRow>
// 														<TableHead>Term</TableHead>
// 														<TableHead>Year</TableHead>
// 														<TableHead>Courses</TableHead>
// 														<TableHead>Students</TableHead>
// 														<TableHead>Credit Hours</TableHead>
// 														<TableHead className="text-right">Actions</TableHead>
// 													</TableRow>
// 												</TableHeader>
// 												<TableBody>
// 													{currentItems.map((term, index) => (
// 														<TableRow key={index}>
// 															<TableCell className="font-medium">{term.termName}</TableCell>
// 															<TableCell>{term.year}</TableCell>
// 															<TableCell>{term.courseCount}</TableCell>
// 															<TableCell>{term.studentCount}</TableCell>
// 															<TableCell>{term.creditHoursDelivered}</TableCell>
// 															<TableCell className="text-right">
// 																<Button
// 																	onClick={() => handleViewDetails(term.termCode, term.year)}>
// 																	View Details
// 																</Button>
// 															</TableCell>
// 														</TableRow>
// 													))}
// 												</TableBody>
// 											</Table>
// 										</div>

// 										{/* Pagination Controls */}
// 										{totalPages > 1 && (
// 											<div className="flex items-center justify-between mt-4">
// 												<div className="text-sm text-muted-foreground">
// 													Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, termSummaries.length)} of {termSummaries.length} entries
// 												</div>
// 												<div className="flex items-center space-x-2">
// 													<Button
// 														variant="outline"
// 														size="sm"
// 														onClick={goToPrevPage}
// 														disabled={currentPage === 1}
// 													>
// 														<ChevronLeft className="h-4 w-4" />
// 													</Button>
// 													{[...Array(totalPages)].map((_, i) => (
// 														<Button
// 															key={i}
// 															variant={currentPage === i + 1 ? "default" : "outline"}
// 															size="sm"
// 															onClick={() => paginate(i + 1)}
// 															className="w-8 h-8 p-0"
// 														>
// 															{i + 1}
// 														</Button>
// 													))}
// 													<Button
// 														variant="outline"
// 														size="sm"
// 														onClick={goToNextPage}
// 														disabled={currentPage === totalPages}
// 													>
// 														<ChevronRight className="h-4 w-4" />
// 													</Button>
// 												</div>
// 											</div>
// 										)}
// 									</>
// 								) : (
// 									<div className="flex flex-col items-center justify-center py-6 text-center">
// 										<p className="text-muted-foreground mb-2">No teaching history available.</p>
// 										<p className="text-sm text-muted-foreground">This faculty member does not have any recorded teaching history.</p>
// 									</div>
// 								)}
// 							</CardContent>
// 						</Card>
// 					</TabsContent>

// 					{/* Grade Distributions Tab */}
// 					<TabsContent value="grade-distributions">
// 						<GradeDistribution
// 							mnumber={mnumber as string}
// 							title={`${instructor?.instructorInfo.name}'s Grade Distributions`}
// 							description={`Showing grade distribution trends over time for ${instructor?.instructorInfo.name}`}
// 						/>
// 					</TabsContent>
// 				</Tabs>
// 			</div>
// 		</div>
// 	);
// };
