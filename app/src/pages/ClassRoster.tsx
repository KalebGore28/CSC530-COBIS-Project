import React, { useState, useEffect } from "react";
import ClassRosterComponent from "@/components/class-roster";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "@/hooks/session-context";
// Define interfaces for API response
interface CourseDetail {
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
}

interface InstructorCoursesResponse {
	mnumber: string;
	courseDetails: CourseDetail[];
}

// Modified ClassRoster component that will fetch data from API
const ClassRosterPage: React.FC = () => {
	const { session } = useSession();
	const [courses, setCourses] = useState<CourseDetail[]>([]);
	const [selectedClass, setSelectedClass] = useState<CourseDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [fetchingRoster, setFetchingRoster] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Fetch courses data from API
	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setLoading(true);
				// Get the M-number from session context
				const mnumber = session?.mnumber;

				if (!mnumber) {
					setError("Authentication required. Please log in.");
					setLoading(false);
					return;
				}

				// Create a request with authentication headers
				const response = await axios.get<InstructorCoursesResponse>(
					`http://localhost:4000/api/instructor/${mnumber}/courses`,
					{
						withCredentials: true
					}
				);

				console.log("Courses:", response.data);

				setCourses(response.data.courseDetails);

				// Set the first course as selected by default if available
				if (response.data.courseDetails.length > 0) {
					setSelectedClass(response.data.courseDetails[0]);
				}

				setLoading(false);
			} catch (err) {
				console.error("Error fetching courses:", err);
				setError("Failed to load courses. Please try again later.");
				setLoading(false);
			}
		};

		fetchCourses();
	}, [session]);

	// Function to handle class selection
	const handleClassChange = (courseId: string) => {
		const selected = courses.find(course =>
			`${course.courseSubject}-${course.courseNumber}-${course.crn}-${course.termName}-${course.year}` === courseId
		);

		if (selected) {
			setSelectedClass(selected);
		}
	};

	// Function to manually trigger data refresh by incrementing the refreshTrigger
	const handleGetRoster = () => {
		console.log("Get Roster button clicked, triggering refresh");
		setFetchingRoster(true);
		// Use a setTimeout to allow state update to propagate
		setTimeout(() => {
			setRefreshTrigger(prev => prev + 1);
			// Add a small delay before setting fetchingRoster back to false
			setTimeout(() => {
				setFetchingRoster(false);
			}, 1000); // Longer delay to ensure component has time to refresh
		}, 100);
	};

	// Format class for display and selection
	const formatClassForDisplay = (course: CourseDetail) => {
		return `${course.courseSubject} ${course.courseNumber}${course.courseSuffix ? `-${course.courseSuffix}` : ''} - ${course.courseTitle} (${course.termName} ${course.year})`;
	};

	// Generate a unique key for each course
	const getCourseKey = (course: CourseDetail) => {
		return `${course.courseSubject}-${course.courseNumber}-${course.crn}-${course.termName}-${course.year}`;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p className="mt-4 text-lg">Loading courses...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-500">Error</h2>
					<p className="mt-2">{error}</p>
					<Button className="mt-4" onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Class Roster</CardTitle>
					<CardDescription>View and manage your class roster</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="w-full md:w-2/3">
							{courses.length > 0 ? (
								<Select
									value={selectedClass ? getCourseKey(selectedClass) : undefined}
									onValueChange={handleClassChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a class" />
									</SelectTrigger>
									<SelectContent>
										{courses.map((course) => (
											<SelectItem
												key={getCourseKey(course)}
												value={getCourseKey(course)}
											>
												{formatClassForDisplay(course)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<p>No courses available</p>
							)}
						</div>
						<div className="w-full md:w-1/3 flex justify-end">
							<Button
								onClick={handleGetRoster}
								disabled={fetchingRoster || !selectedClass}
							>
								{fetchingRoster ? (
									<>
										<div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										Fetching...
									</>
								) : (
									'Get Roster'
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{selectedClass && (
				<ClassRosterComponent
					subject={selectedClass.courseSubject}
					number={selectedClass.courseNumber}
					suffix={selectedClass.courseSuffix}
					section={selectedClass.courseSection}
					term={selectedClass.termCode}
					year={selectedClass.year}
					refreshTrigger={refreshTrigger}
				/>
			)}
		</div>
	);
};

export default ClassRosterPage;
