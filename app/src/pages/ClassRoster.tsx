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
	const [courses, setCourses] = useState<CourseDetail[]>([]);
	const [selectedClass, setSelectedClass] = useState<CourseDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const session = useSession();

	// Fetch courses data from API
	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setLoading(true);
				// In a real app, you would get the M-number from authentication context
				const mnumber = session.session?.mnumber;

				// Create a request with authentication headers
				const response = await axios.get<InstructorCoursesResponse>(
					`http://localhost:4000/api/instructor/${mnumber}/courses`,
					{
						withCredentials: true
					}
				);

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
	}, []);

	// Function to handle class selection
	const handleClassChange = (courseId: string) => {
		const selected = courses.find(course =>
			`${course.courseSubject}-${course.courseNumber}-${course.crn}-${course.termName}-${course.year}` === courseId
		);

		if (selected) {
			setSelectedClass(selected);
		}
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
							<Button>New Roster</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{selectedClass && (
				<ClassRosterComponent
					subject={selectedClass.courseSubject}
					number={selectedClass.courseNumber}
					suffix={selectedClass.courseSuffix}
					section={selectedClass.crn} // Using CRN as the section since it's a unique identifier
					term={selectedClass.termName}
					year={selectedClass.year}
				/>
			)}
		</div>
	);
};

export default ClassRosterPage;
