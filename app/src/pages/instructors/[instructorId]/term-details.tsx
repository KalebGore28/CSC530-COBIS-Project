import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Loader2,
	AlertCircle,
	BookOpen,
	Users,
	Calculator
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Course } from "@/components/selectors/course-selector";
import AdvisorAdvisedStudents from '@/components/advisor-advised-students';

// Types based on API response
type CourseResponse = {
	mnumber: string;
	termCode: string;
	year: number;
	courseDetails: Course[];
};

// Instructor type for the breadcrumb context
type Instructor = {
	name: string;
	department: string;
	departmentCode: string;
};

const TermDetailsPage: React.FC = () => {
	// Get URL parameters
	const { mnumber, yearTerm } = useParams();

	const termCode = yearTerm?.slice(-2);
	const year = yearTerm?.slice(0, 4);

	// term mappings
	const termMappings: Record<string, string> = {
		'10': 'Spring',
		'50': 'Summer',
		'80': 'Fall',
		'90': 'Winter'
	};

	const navigate = useNavigate();

	// State variables
	const [courseData, setCourseData] = useState<CourseResponse | null>(null);
	const [instructorData, setInstructorData] = useState<Instructor | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useSetBreadcrumb(
		yearTerm as string,
		`${termMappings[termCode as string] || 'Term'} ${year}`,
	);

	// Fetch course data for the specified term and year
	useEffect(() => {
		const fetchCourseData = async () => {
			if (!mnumber || !termCode || !year) return;

			try {
				setIsLoading(true);
				const response = await axios.get(`/api/instructor/${mnumber}/courses`, {
					params: {
						term: termCode,
						year: year
					},
					withCredentials: true
				});

				setCourseData(response.data);
				setError(null);
			} catch (err) {
				console.error('Error fetching course data:', err);
				setError('Failed to load course information. Please try again later.');
			} finally {
				setIsLoading(false);
			}
		};

		// Also fetch basic instructor info for header/breadcrumb context
		const fetchInstructorData = async () => {
			if (!mnumber) return;

			try {
				const response = await axios.get(`/api/instructor/${mnumber}`, {
					withCredentials: true
				});

				// Assuming the API returns an array with a single instructor object
				if (response.data && Array.isArray(response.data) && response.data.length > 0) {
					setInstructorData({
						name: response.data[0].name,
						department: response.data[0].department,
						departmentCode: response.data[0].departmentCode
					});
				} else if (response.data && response.data.instructorInfo) {
					// Alternative API structure
					setInstructorData({
						name: response.data.instructorInfo.name,
						department: response.data.instructorInfo.department,
						departmentCode: response.data.instructorInfo.departmentCode
					});
				}
			} catch (err) {
				console.error('Error fetching instructor data:', err);
				// We'll continue even if this fails, so not setting the main error state
			}
		};

		fetchCourseData();
		fetchInstructorData();
	}, [mnumber, termCode, year]);

	// Helper function to format the term name
	const formatTermName = (termName: string): string => {
		return termName.charAt(0).toUpperCase() + termName.slice(1).toLowerCase();
	};

	const handleViewRoster = (courseId: string) => {
		navigate(`/instructors/${mnumber}/${yearTerm}/${courseId}`);
	};

	// Calculate summary statistics
	const totalCourses = courseData?.courseDetails.length || 0;
	const totalStudents = courseData?.courseDetails.reduce((sum, course) => sum + course.studentCount, 0) || 0;
	const totalCreditHours = courseData?.courseDetails.reduce((sum, course) => sum + course.totalCreditHours, 0) || 0;

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col space-y-6">
				{/* Back button and header */}
				<div className="flex flex-col gap-4">
					<Button
						variant="outline"
						size="sm"
						className="w-fit"
						onClick={() => navigate(`/instructors/${mnumber}`)}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Instructor Profile
					</Button>

					<div className="flex flex-col gap-1">
						<h1 className="text-3xl font-bold tracking-tight">
							{isLoading ? 'Loading...' :
								courseData?.courseDetails[0]?.termName
									? `${formatTermName(courseData.courseDetails[0].termName)} ${courseData.year}`
									: `Term Details`}
						</h1>
						{instructorData && (
							<p className="text-muted-foreground">
								Courses taught by {instructorData.name} • {instructorData.department}
							</p>
						)}
					</div>
				</div>

				{/* Loading and error states */}
				{isLoading && (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2">Loading course information...</span>
					</div>
				)}

				{error && !isLoading && (
					<Card className="border-destructive">
						<CardContent className="pt-6">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium text-destructive">Error loading course data</p>
									<p className="text-sm text-muted-foreground">{error}</p>
									<Button
										variant="outline"
										size="sm"
										className="mt-4"
										onClick={() => window.location.reload()}
									>
										Try Again
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{!isLoading && !error && courseData && (
					<>
						{/* Statistics summary cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card>
								<CardContent className="pt-6">
									<div className="flex items-center gap-3">
										<BookOpen className="h-8 w-8 text-primary" />
										<div>
											<p className="text-sm font-medium text-muted-foreground">Courses</p>
											<p className="text-3xl font-bold">{totalCourses}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<div className="flex items-center gap-3">
										<Users className="h-8 w-8 text-primary" />
										<div>
											<p className="text-sm font-medium text-muted-foreground">Students</p>
											<p className="text-3xl font-bold">{totalStudents}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<div className="flex items-center gap-3">
										<Calculator className="h-8 w-8 text-primary" />
										<div>
											<p className="text-sm font-medium text-muted-foreground">Credit Hours</p>
											<p className="text-3xl font-bold">{totalCreditHours}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Course details table */}
						<Card>
							<CardHeader>
								<CardTitle>Course Details</CardTitle>
								<CardDescription>
									{courseData.courseDetails.length} course{courseData.courseDetails.length !== 1 ? 's' : ''} taught in {courseData.courseDetails[0]?.termName} {courseData.year}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{courseData.courseDetails.length > 0 ? (
									<div className="rounded-md border">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Course</TableHead>
													<TableHead>Title</TableHead>
													<TableHead>Section</TableHead>
													<TableHead>CRN</TableHead>
													<TableHead>Credit Hours</TableHead>
													<TableHead>Students</TableHead>
													<TableHead className="text-right">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{courseData.courseDetails.map((course, index) => (
													<TableRow key={index}>
														<TableCell className="font-medium">
															{course.courseSubject} {course.courseNumber}{course.courseSuffix}
														</TableCell>
														<TableCell>{course.courseTitle}</TableCell>
														<TableCell>{course.courseSection}</TableCell>
														<TableCell>{course.crn}</TableCell>
														<TableCell>{course.creditHours}</TableCell>
														<TableCell>
															<Badge variant="outline" className="font-normal">
																{course.studentCount} student{course.studentCount !== 1 ? 's' : ''}
															</Badge>
														</TableCell>
														<TableCell className="text-right">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleViewRoster(course.courseId)}
															>
																View Roster
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-12 text-center">
										<BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
										<h3 className="text-lg font-medium">No courses found</h3>
										<p className="text-muted-foreground mt-1">
											The instructor was not teaching any courses during this term.
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Faculty advisees */}
						<AdvisorAdvisedStudents
							title='Advised Students'
							term={termCode}
							year={parseInt(year)}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default TermDetailsPage;