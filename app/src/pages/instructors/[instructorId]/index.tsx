import React, { useEffect, useState } from 'react';
import { useSetBreadcrumb } from '@/context/breadcrumb';
import axios from 'axios';
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import {
	Mail,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
	Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { GradeDistributions, GradeDistributionData } from '@/components/charts/grade-distributions';
// Types based on API responses
type InstructorResponse = {
	mnumber: string;
	instructorInfo: {
		name: string;
		firstName: string;
		lastName: string;
		department: string;
		departmentCode: string;
		college: string;
		collegeCode: string;
		email: string;
		image: string;
	};
};

type CurrentTermResponse = {
	term: string;
	year: number;
	termName: string;
};

type CourseDetail = {
	termName: string;
	termCode: string;
	year: number;
	courseId: string;
	courseTitle: string;
	courseSubject: string;
	courseNumber: string;
	courseSuffix: string;
	courseSection: string;
	crn: string;
	creditHours: number;
	studentCount: number;
	totalCreditHours: number;
};

type CourseResponse = {
	mnumber: string;
	termCode: string;
	year: number;
	courseDetails: CourseDetail[];
};

type TermSummary = {
	termCode: string;
	termName: string;
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
};

type TermSummariesResponse = {
	mnumber: string;
	termSummaries: TermSummary[];
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
	return name
		.split(' ')
		.map(part => part.charAt(0))
		.join('')
		.toUpperCase();
};

const FacultyProfilePage: React.FC = () => {
	const { mnumber } = useParams();
	const navigate = useNavigate();

	// State for data
	const [instructor, setInstructor] = useState<InstructorResponse | null>(null);
	const [currentTerm, setCurrentTerm] = useState<CurrentTermResponse | null>(null);
	const [courses, setCourses] = useState<CourseDetail[]>([]);
	const [termSummaries, setTermSummaries] = useState<TermSummary[]>([]);
	const [gradeDistributions, setGradeDistributions] = useState<GradeDistributionData[]>([]);

	useSetBreadcrumb(
		mnumber as string,
		instructor?.instructorInfo?.name || null
	);

	// State for loading
	const [loadingInstructor, setLoadingInstructor] = useState(true);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [loadingTerms, setLoadingTerms] = useState(true);
	const [loadingGradeDistributions, setLoadingGradeDistributions] = useState(true);
	// State for pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(5);

	// API fetch functions
	const fetchInstructorData = async () => {
		try {
			setLoadingInstructor(true);
			const response = await axios.get<InstructorResponse>(`/api/instructor/${mnumber}`, {
				withCredentials: true
			});
			setInstructor(response.data);
		} catch (error) {
			toast.error("Failed to load instructor information")
		} finally {
			setLoadingInstructor(false);
		}
	};

	const fetchCurrentTerm = async () => {
		try {
			const response = await axios.get<CurrentTermResponse>('/api/utility/current-term', {
				withCredentials: true
			});
			setCurrentTerm(response.data);
			return response.data;
		} catch (error) {
			toast.error("Failed to load current term information")
			return null;
		}
	};

	const fetchCourses = async (term: string, year: number) => {
		try {
			setLoadingCourses(true);
			const response = await axios.get<CourseResponse>(
				`/api/instructor/${mnumber}/courses`, {
				params: { term, year },
				withCredentials: true
			}
			);
			setCourses(response.data.courseDetails);
		} catch (error) {
			toast.error("Failed to load course information")
			setCourses([]);
		} finally {
			setLoadingCourses(false);
		}
	};

	const fetchTermSummaries = async () => {
		try {
			setLoadingTerms(true);
			const response = await axios.get<TermSummariesResponse>(`/api/instructor/${mnumber}/terms`, {
				withCredentials: true
			});
			setTermSummaries(response.data.termSummaries);
		} catch (error) {
			toast.error("Failed to load teaching history")
			setTermSummaries([]);
		} finally {
			setLoadingTerms(false);
		}
	};

	const fetchGradeDistributions = async (yearOffset: number = -1) => {
		try {
			setLoadingGradeDistributions(true);

			const response = await axios.get<{
				mnumber: string;
				start_year: number;
				end_year: number;
				gradeTrends: Array<{
					term: string;
					year: number;
					totalStudents: number;
					distribution: {
						[grade: string]: {
							count: number;
							percentage: number;
						}
					}
				}>
			}>(`/api/instructor/${mnumber}/trend/grades`, {
				params: {
					start_year: currentTerm ? currentTerm.year + yearOffset : undefined,
					end_year: currentTerm ? currentTerm.year : undefined
				},
				withCredentials: true
			});

			console.log(response.data);

			// Transform the data to match GradeDistributionData type
			const transformedData = response.data.gradeTrends.map(trend => ({
				term: trend.term,
				year: trend.year,
				totalStudents: trend.totalStudents,
				distribution: trend.distribution
			}));

			// Add a baseline data point with all zeros at the start of the time range
			const baselineData: GradeDistributionData = {
				term: "10", // Spring term
				year: response.data.start_year,
				totalStudents: 0,
				distribution: {
					"A": { count: 0, percentage: 0 },
					"B": { count: 0, percentage: 0 },
					"C": { count: 0, percentage: 0 },
					"D": { count: 0, percentage: 0 },
					"F": { count: 0, percentage: 0 },
					"N/A": { count: 0, percentage: 0 }
				}
			};

			setGradeDistributions([baselineData, ...transformedData]);
		} catch (error) {
			toast.error("Failed to load grade distributions")
			setGradeDistributions([]);
		} finally {
			setLoadingGradeDistributions(false);
		}
	};

	// Initial data load
	useEffect(() => {
		const loadData = async () => {
			await fetchInstructorData();
			const termData = await fetchCurrentTerm();
			if (termData) {
				await fetchCourses(termData.term, termData.year);
			}
			await fetchTermSummaries();
		};

		loadData();
	}, [mnumber]);

	useEffect(() => {
		if (currentTerm) {
			fetchGradeDistributions();
		}
	}, [currentTerm]);

	// Pagination logic
	const totalPages = Math.ceil(termSummaries.length / itemsPerPage);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = termSummaries.slice(indexOfFirstItem, indexOfLastItem);

	const paginate = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const goToPrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleViewDetails = (termCode: string, year: number) => {
		navigate(`/instructors/${mnumber}/${year}${termCode}`);
	};

	// Loading state
	if (loadingInstructor && loadingCourses && loadingTerms) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading faculty information...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 max-w-5xl">
			<Toaster />
			<div className="grid gap-6">
				{/* Header section with profile info */}
				<div className="flex flex-col md:flex-row gap-6 items-start">
					<div className="flex-shrink-0">
						{loadingInstructor ? (
							<div className="h-24 w-24 rounded-full flex items-center justify-center bg-muted">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						) : instructor ? (
							<Avatar className="h-24 w-24 border-2 border-primary">
								<AvatarImage src={instructor.instructorInfo.image} alt={instructor.instructorInfo.name} />
								<AvatarFallback className="text-2xl">
									{getInitials(instructor.instructorInfo.name)}
								</AvatarFallback>
							</Avatar>
						) : (
							<Avatar className="h-24 w-24 border-2 border-primary">
								<AvatarFallback className="text-2xl">
									<AlertCircle className="h-8 w-8" />
								</AvatarFallback>
							</Avatar>
						)}
					</div>

					<div className="flex-grow space-y-2">
						<div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
							<div>
								{loadingInstructor ? (
									<div className="space-y-2">
										<div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
										<div className="h-6 w-36 bg-muted rounded animate-pulse"></div>
										<div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
									</div>
								) : instructor ? (
									<>
										<h1 className="text-3xl font-bold">{instructor.instructorInfo.name}</h1>
										<p className="text-xl text-muted-foreground">{instructor.instructorInfo.department}</p>
										<p className="text-sm text-muted-foreground">{instructor.instructorInfo.college}</p>
									</>
								) : (
									<div className="space-y-1">
										<p className="text-3xl font-bold text-muted">No data available</p>
										<p className="text-sm text-muted-foreground">Instructor information could not be loaded</p>
									</div>
								)}
							</div>

							<div className="flex flex-col gap-2">
								{loadingCourses ? (
									<div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
								) : courses && courses.length > 0 ? (
									<Badge className="self-start" variant="outline">Currently Teaching</Badge>
								) : (
									<Badge className="self-start" variant="outline">Not Currently Teaching</Badge>
								)}

								{instructor && (
									<div className="flex items-center gap-2">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<a href={`mailto:${instructor.instructorInfo.email}`} className="text-sm hover:underline">
											{instructor.instructorInfo.email || 'N/A'}
										</a>
									</div>
								)}
							</div>
						</div>

						<Separator />

						{/* Quick Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
							<div className="flex flex-col">
								<span className="text-sm text-muted-foreground">Current Term</span>
								{loadingCourses ? (
									<div className="h-5 w-24 bg-muted rounded animate-pulse mt-1"></div>
								) : currentTerm ? (
									<span className="font-medium">{currentTerm.termName} {currentTerm.year}</span>
								) : (
									<span className="text-muted">Not available</span>
								)}
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-muted-foreground">Current Courses</span>
								{loadingCourses ? (
									<div className="h-5 w-8 bg-muted rounded animate-pulse mt-1"></div>
								) : (
									<span className="font-medium">{courses ? courses.length : 0}</span>
								)}
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-muted-foreground">Department Code</span>
								{loadingInstructor ? (
									<div className="h-5 w-12 bg-muted rounded animate-pulse mt-1"></div>
								) : instructor ? (
									<span className="font-medium">{instructor.instructorInfo.departmentCode}</span>
								) : (
									<span className="text-muted">Not available</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Additional Information Tabs */}
				<Tabs defaultValue="current" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="current">Current Term</TabsTrigger>
						<TabsTrigger value="history">Teaching History</TabsTrigger>
						<TabsTrigger value="grade-distributions">Grade Distributions</TabsTrigger>
					</TabsList>

					{/* Current Term Tab */}
					<TabsContent value="current">
						<Card>
							<CardHeader>
								<CardTitle>
									{currentTerm ? `Current Term: ${currentTerm.termName} ${currentTerm.year}` : 'Current Term'}
								</CardTitle>
								<CardDescription>
									{loadingCourses ? 'Loading course information...' :
										courses.length > 0 ? `Currently teaching ${courses.length} courses` : 'No courses this term'}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{loadingCourses ? (
										<div className="space-y-4">
											<div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
											<div className="h-48 w-full bg-muted rounded animate-pulse"></div>
										</div>
									) : courses.length > 0 ? (
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg">Current Schedule</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="rounded-md border">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Course</TableHead>
																<TableHead>Title</TableHead>
																<TableHead>CRN</TableHead>
																<TableHead>Section</TableHead>
																<TableHead>Credit Hours</TableHead>
																<TableHead>Students</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{courses.map((course, index) => (
																<TableRow key={index}>
																	<TableCell className="font-medium">
																		{`${course.courseSubject} ${course.courseNumber}${course.courseSuffix}`}
																	</TableCell>
																	<TableCell>{course.courseTitle}</TableCell>
																	<TableCell>{course.crn}</TableCell>
																	<TableCell>{course.courseSection}</TableCell>
																	<TableCell>{course.creditHours}</TableCell>
																	<TableCell>{course.studentCount}</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
											</CardContent>
										</Card>
									) : (
										<div className="flex flex-col items-center justify-center py-6 text-center">
											<p className="text-muted-foreground mb-2">No courses scheduled for this term.</p>
											<p className="text-sm text-muted-foreground">The faculty member is not currently teaching any courses.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Teaching History Tab */}
					<TabsContent value="history">
						<Card>
							<CardHeader>
								<CardTitle>Teaching History</CardTitle>
								<CardDescription>
									Summary of courses taught across terms
								</CardDescription>
							</CardHeader>
							<CardContent>
								{loadingTerms ? (
									<div className="space-y-4 py-4">
										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
										<div className="h-8 w-full bg-muted rounded animate-pulse"></div>
									</div>
								) : termSummaries.length > 0 ? (
									<>
										<div className="rounded-md border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Term</TableHead>
														<TableHead>Year</TableHead>
														<TableHead>Courses</TableHead>
														<TableHead>Students</TableHead>
														<TableHead>Credit Hours</TableHead>
														<TableHead className="text-right">Actions</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{currentItems.map((term, index) => (
														<TableRow key={index}>
															<TableCell className="font-medium">{term.termName}</TableCell>
															<TableCell>{term.year}</TableCell>
															<TableCell>{term.courseCount}</TableCell>
															<TableCell>{term.studentCount}</TableCell>
															<TableCell>{term.creditHoursDelivered}</TableCell>
															<TableCell className="text-right">
																<Button
																	onClick={() => handleViewDetails(term.termCode, term.year)}>
																	View Details
																</Button>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>

										{/* Pagination Controls */}
										{totalPages > 1 && (
											<div className="flex items-center justify-between mt-4">
												<div className="text-sm text-muted-foreground">
													Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, termSummaries.length)} of {termSummaries.length} entries
												</div>
												<div className="flex items-center space-x-2">
													<Button
														variant="outline"
														size="sm"
														onClick={goToPrevPage}
														disabled={currentPage === 1}
													>
														<ChevronLeft className="h-4 w-4" />
													</Button>
													{[...Array(totalPages)].map((_, i) => (
														<Button
															key={i}
															variant={currentPage === i + 1 ? "default" : "outline"}
															size="sm"
															onClick={() => paginate(i + 1)}
															className="w-8 h-8 p-0"
														>
															{i + 1}
														</Button>
													))}
													<Button
														variant="outline"
														size="sm"
														onClick={goToNextPage}
														disabled={currentPage === totalPages}
													>
														<ChevronRight className="h-4 w-4" />
													</Button>
												</div>
											</div>
										)}
									</>
								) : (
									<div className="flex flex-col items-center justify-center py-6 text-center">
										<p className="text-muted-foreground mb-2">No teaching history available.</p>
										<p className="text-sm text-muted-foreground">This faculty member does not have any recorded teaching history.</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Grade Distributions Tab */}
					<TabsContent value="grade-distributions">
						<GradeDistributions
							title={`${instructor?.instructorInfo.name}'s Grade Distributions`}
							description={`Showing grade distribution trends over time for ${instructor?.instructorInfo.name}`}
							data={gradeDistributions}
							onTimeRangeChange={fetchGradeDistributions}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default FacultyProfilePage;