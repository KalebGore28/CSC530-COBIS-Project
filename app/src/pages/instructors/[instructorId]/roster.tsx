import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertCircle,
	Filter,
	Search,
	SortAsc,
	SortDesc,
	UserRound,
	ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/loading/selector-skeleton";
import { ExportButton } from "@/components/common/export-button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";
import { Modal } from "@/components/modals/modal";
import StudentDetail from '@/components/student-detail';


/**
 * Student interface representing a student in the class roster
 */
export interface Student {
	mnumber: string;
	name: string;
	firstName: string;
	middleName: string;
	lastName: string;
	suffix: string;
	email: string;
	major: string;
	finalGrade: string;
	midtermGrade: string;
	registrationStatus: string;
	instructionalMethod: string;
	lastAttendance: string | null;
	overallGpa: number;
	overallEarnedHours: number;
}

/**
 * Course info from roster response
 */
export interface RosterCourse {
	courseId: string;
	courseSubject: string;
	courseNumber: string;
	courseSuffix: string;
	courseSection: string;
	courseTitle: string;
	termCode: string;
	termName: string;
	year: number;
	creditHours: number;
}

/**
 * Stats from roster response
 */
export interface RosterStats {
	totalStudents: number;
	totalGraded: number;
	overallGpa: number;
	gradeDistribution: Record<string, number>;
}

/**
 * Course Roster Page
 * 
 * This component displays a class roster for a specific course
 * It uses URL parameters to fetch the roster data
 */
const CourseRosterPage: React.FC = () => {
	// Get URL parameters
	const { mnumber, yearTerm, courseId } = useParams();
	const navigate = useNavigate();
	const termCode = yearTerm?.slice(-2);
	const year = yearTerm?.slice(0, 4);

	// Parse the courseId parameter
	// Expected format: {subject}{number}{optional_suffix}-{section}
	// Example: CSC101-01
	const [courseParams, setCourseParams] = useState<{
		subject: string;
		number: string;
		suffix: string;
		section: string;
	} | null>(null);

	// State variables
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [courseInfo, setCourseInfo] = useState<RosterCourse | null>(null);
	const [students, setStudents] = useState<Student[]>([]);
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
	const [stats, setStats] = useState<RosterStats | null>(null);

	// Filters and sorting
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState<"name" | "grade">("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [gradeFilter, setGradeFilter] = useState<string>("all");


	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedStudentName, setSelectedStudentName] = useState<string>('');

	// Parse courseId on component mount
	useEffect(() => {
		if (courseId) {
			const match = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/);

			if (match) {
				setCourseParams({
					subject: match[1],
					number: match[2],
					suffix: match[3] || '',
					section: match[4]
				});
			} else {
				setError("Invalid course ID format");
			}
		}
	}, [courseId]);

	// Fetch roster data when parameters are ready
	useEffect(() => {
		const fetchRosterData = async () => {
			if (!courseParams || !mnumber || !termCode || !year) {
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const response = await axios.get(
					`/api/instructor/${mnumber}/class-roster`,
					{
						params: {
							subject: courseParams.subject,
							number: courseParams.number,
							suffix: courseParams.suffix,
							term: termCode,
							year: year,
							section: courseParams.section
						},
						withCredentials: true,
					}
				);
				console.log(response.data);

				if (response.data && response.data.classRoster) {
					const { course, roster, stats } = response.data.classRoster;
					setCourseInfo(course);
					setStudents(roster);
					setFilteredStudents(roster);
					setStats(stats);
				} else {
					setError("Invalid response format from server");
				}
			} catch (err: any) {
				console.error("Error fetching class roster:", err);
				setError(err.message || "Failed to load class roster");
			} finally {
				setLoading(false);
			}
		};

		fetchRosterData();
		console.log(mnumber, termCode, year, courseParams);
	}, [mnumber, termCode, year, courseParams]);

	// Apply filters and sorting
	useEffect(() => {
		let result = [...students];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(student) =>
					student.firstName.toLowerCase().includes(query) ||
					student.lastName.toLowerCase().includes(query) ||
					student.mnumber.toLowerCase().includes(query) ||
					student.email.toLowerCase().includes(query) ||
					student.major.toLowerCase().includes(query)
			);
		}

		// Apply grade filter
		if (gradeFilter !== "all") {
			result = result.filter((student) => {
				const grade = student.finalGrade !== "N/A" ? student.finalGrade : student.midtermGrade;
				if (grade === "N/A") return false;

				// Simple matching for letter grades
				return grade.startsWith(gradeFilter);
			});
		}

		// Apply sorting
		result.sort((a, b) => {
			if (sortField === "name") {
				const nameA = `${a.lastName}, ${a.firstName}`;
				const nameB = `${b.lastName}, ${b.firstName}`;
				return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
			} else {
				// Simple grade sorting
				const gradeA = a.finalGrade !== "N/A" ? a.finalGrade : a.midtermGrade;
				const gradeB = b.finalGrade !== "N/A" ? b.finalGrade : b.midtermGrade;

				// If both grades are "N/A", consider them equal
				if (gradeA === "N/A" && gradeB === "N/A") return 0;
				// If only one grade is "N/A", put it at the end
				if (gradeA === "N/A") return sortDirection === "asc" ? 1 : -1;
				if (gradeB === "N/A") return sortDirection === "asc" ? -1 : 1;

				// Otherwise, compare the grades alphabetically
				return sortDirection === "asc"
					? gradeA.localeCompare(gradeB)
					: gradeB.localeCompare(gradeA);
			}
		});

		setFilteredStudents(result);
	}, [students, searchQuery, sortField, sortDirection, gradeFilter]);

	const getGradeColorClass = (grade: string) => {
		if (grade === "N/A") return "";
		if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-300";
		if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-300";
		if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
		if (grade.startsWith("D")) return "bg-orange-100 text-orange-800 border-orange-300";
		return "bg-red-100 text-red-800 border-red-300";
	};

	const isTermActive = () => {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth(); // 0-11

		if (!courseInfo) return false;

		// If the course year is in the future, it's active
		if (courseInfo.year > currentYear) return true;
		// If the course year is in the past, it's not active
		if (courseInfo.year < currentYear) return false;

		// If we're in the same year, check the term
		// Assuming: "10" = Spring, "50" = Summer, "80" = Fall
		if (courseInfo.termCode === "10") return currentMonth < 5; // Spring ends in May
		if (courseInfo.termCode === "50") return currentMonth >= 5 && currentMonth < 8; // Summer is May-July
		if (courseInfo.termCode === "80") return currentMonth >= 8; // Fall is August-December

		return false;
	};

	// Navigate back to term details
	const handleBackToTerm = () => {
		navigate(`/instructors/${mnumber}/${yearTerm}`);
	};

	// --- Modified Student Select Handler (for Modal) ---
	const handleStudentSelect = (student: Student) => {
		if (!student || !student.mnumber) {
			console.error("Invalid student data for modal:", student);
			// Consider adding a user-facing error notification (e.g., toast)
			return;
		}
		console.log(`Opening details for student: ${student.firstName} ${student.lastName} (${student.mnumber})`);
		setSelectedMnumber(student.mnumber);
		setSelectedStudentName(`${student.firstName} ${student.lastName}`);
		setIsModalOpen(true); // Open the modal
	};

	// --- Add Modal Close Handler ---
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedMnumber(null);
		setSelectedStudentName('');
	};
	if (loading) {
		return <SkeletonCard showTitle showDescription lines={5} className="container mx-auto p-6" />;
	}

	if (error) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Class Roster</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					<Button
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={handleBackToTerm}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Term
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!courseInfo || !stats) {
		return (
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Class Roster</CardTitle>
					<CardDescription>No data available</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						size="sm"
						onClick={handleBackToTerm}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Term
					</Button>
				</CardContent>
			</Card>
		);
	}

	const isActive = isTermActive();
	const exportFilename = `${courseInfo.courseSubject}${courseInfo.courseNumber}${courseInfo.courseSuffix}-${courseInfo.courseSection}_${courseInfo.termName}_${courseInfo.year}`;

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col space-y-6">
				{/* Back button */}
				<Button
					variant="outline"
					size="sm"
					className="w-fit"
					onClick={handleBackToTerm}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Term Details
				</Button>

				{/* Course Information Card */}
				<Card className="w-full">
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row justify-between gap-4">
							<div className="space-y-1">
								<h2 className="text-2xl font-bold">
									{courseInfo.courseSubject} {courseInfo.courseNumber}
									{courseInfo.courseSuffix} - {courseInfo.courseSection}
								</h2>
								<p className="text-xl">{courseInfo.courseTitle}</p>
								<p className="text-muted-foreground">
									{courseInfo.termName} {courseInfo.year} • {courseInfo.creditHours} Credit Hours
								</p>
							</div>
							<div className="flex flex-col items-end justify-center">
								<Badge variant={isActive ? "default" : "secondary"} className="mb-2 text-white">
									{isActive ? "Active" : "Completed"}
								</Badge>
								<div className="text-right">
									<p className="text-sm text-muted-foreground">Enrollment</p>
									<p className="text-2xl font-bold">{stats.totalStudents} students</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Class Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Grade Distribution</CardTitle>
							<CardDescription>
								{isActive ? "Current midterm grades" : "Final grades"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PieChartDonut data={
								Object.entries(stats.gradeDistribution).map(([grade, count]) => ({
									grade,
									count,
								}))
							} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Class Summary</CardTitle>
							<CardDescription>Performance metrics and statistics</CardDescription>
						</CardHeader>
						<CardContent>
							<dl className="grid grid-cols-1 gap-4 text-sm">
								<div className="grid grid-cols-2 gap-1">
									<dt className="font-medium text-muted-foreground">Average Grade:</dt>
									<dd className="font-semibold">
										{stats.overallGpa ? stats.overallGpa.toFixed(2) : "N/A"}
									</dd>
								</div>
								<div className="grid grid-cols-2 gap-1">
									<dt className="font-medium text-muted-foreground">Total Students:</dt>
									<dd className="font-semibold">{stats.totalStudents}</dd>
								</div>
								<div className="grid grid-cols-2 gap-1">
									<dt className="font-medium text-muted-foreground">Students Graded:</dt>
									<dd className="font-semibold">{stats.totalGraded}</dd>
								</div>
								<div className="grid grid-cols-2 gap-1">
									<dt className="font-medium text-muted-foreground">Course ID:</dt>
									<dd className="font-semibold">{courseInfo.courseId}</dd>
								</div>
								<div className="grid grid-cols-2 gap-1">
									<dt className="font-medium text-muted-foreground">Term:</dt>
									<dd className="font-semibold">{courseInfo.termName} {courseInfo.year}</dd>
								</div>
							</dl>
						</CardContent>
					</Card>
				</div>

				{/* Student Roster */}
				<Card>
					<CardHeader>
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div>
								<CardTitle>Student Roster</CardTitle>
								<CardDescription>
									{filteredStudents.length} of {students.length} students
								</CardDescription>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
								<div className="relative w-full sm:w-64">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search students..."
										className="pl-8 w-full"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<Select value={gradeFilter} onValueChange={setGradeFilter}>
									<SelectTrigger className="w-full sm:w-32">
										<Filter className="mr-2 h-4 w-4" />
										<SelectValue placeholder="Filter" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Grades</SelectItem>
										<SelectItem value="A">A</SelectItem>
										<SelectItem value="B">B</SelectItem>
										<SelectItem value="C">C</SelectItem>
										<SelectItem value="D">D</SelectItem>
										<SelectItem value="F">F</SelectItem>
										<SelectItem value="W">W</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
									{sortDirection === "asc" ? (
										<SortAsc className="mr-2 h-4 w-4" />
									) : (
										<SortDesc className="mr-2 h-4 w-4" />
									)}
									Sort
								</Button>

								{/* Export Dropdown Button */}
								<ExportButton
									data={filteredStudents}
									filename={exportFilename}
									isActiveTerm={isActive}
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<Tabs defaultValue="list" className="w-full">
							<TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
								<TabsTrigger value="list">List View</TabsTrigger>
								<TabsTrigger value="grid">Grid View</TabsTrigger>
							</TabsList>

							<TabsContent value="list">
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead
													className="w-[200px] cursor-pointer"
													onClick={() => {
														setSortField("name");
														setSortDirection(sortField === "name" && sortDirection === "asc" ? "desc" : "asc");
													}}
												>
													Student Name{" "}
													{sortField === "name" &&
														(sortDirection === "asc" ? (
															<SortAsc className="inline h-4 w-4" />
														) : (
															<SortDesc className="inline h-4 w-4" />
														))}
												</TableHead>
												<TableHead>M-Number</TableHead>
												<TableHead>Major</TableHead>
												<TableHead
													className="cursor-pointer"
													onClick={() => {
														setSortField("grade");
														setSortDirection(sortField === "grade" && sortDirection === "asc" ? "desc" : "asc");
													}}
												>
													{isActive ? "Midterm Grade" : "Final Grade"}{" "}
													{sortField === "grade" &&
														(sortDirection === "asc" ? (
															<SortAsc className="inline h-4 w-4" />
														) : (
															<SortDesc className="inline h-4 w-4" />
														))}
												</TableHead>
												<TableHead>Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredStudents.length > 0 ? (
												filteredStudents.map((student, index) => (
													<TableRow key={index} className="group cursor-pointer"
														onClick={() => handleStudentSelect(student)}
													>
														<TableCell className="font-medium">
															<button
																className="text-left hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-0.5 -mx-1 -my-0.5"
															>
																{student.lastName}, {student.firstName}{" "}
																{student.middleName ? `${student.middleName.charAt(0)}.` : ""}
																{student.suffix ? `, ${student.suffix}` : ""}
															</button>
														</TableCell>
														<TableCell>{student.mnumber}</TableCell>
														<TableCell>{student.major}</TableCell>
														<TableCell>
															{isActive ? (
																<Badge className={getGradeColorClass(student.midtermGrade)}>
																	{student.midtermGrade}
																</Badge>
															) : (
																<Badge className={getGradeColorClass(student.finalGrade)}>
																	{student.finalGrade}
																</Badge>
															)}
														</TableCell>
														<TableCell>{student.registrationStatus}</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={5} className="text-center py-4">
														No students found matching the current filters
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
							</TabsContent>

							<TabsContent value="grid" className="max-w-full overflow-x-auto">
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
									{filteredStudents.length > 0 ? (
										filteredStudents.map((student, index) => (
											<Card
												key={index}
												className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
												onClick={() => handleStudentSelect(student)}
											>
												<CardContent className="p-4">
													<div className="flex flex-col gap-2">
														<div className="flex justify-between items-start">
															<div className="flex items-center gap-2">
																<UserRound className="h-5 w-5 text-muted-foreground" />
																<div>
																	<h3 className="font-semibold text-lg hover:text-primary">
																		{student.firstName} {student.lastName}
																		{student.suffix ? `, ${student.suffix}` : ""}
																	</h3>
																	<p className="text-sm text-muted-foreground">{student.mnumber}</p>
																</div>
															</div>
															{isActive ? (
																<Badge className={getGradeColorClass(student.midtermGrade)}>
																	{student.midtermGrade}
																</Badge>
															) : (
																<Badge className={getGradeColorClass(student.finalGrade)}>
																	{student.finalGrade}
																</Badge>
															)}
														</div>
														<div className="grid grid-cols-2 gap-1 text-sm">
															<span className="text-muted-foreground">Major:</span>
															<span>{student.major}</span>
														</div>
														<div className="grid grid-cols-2 gap-1 text-sm">
															<span className="text-muted-foreground">Status:</span>
															<span>{student.registrationStatus}</span>
														</div>
														<div className="grid grid-cols-2 gap-1 text-sm">
															<span className="text-muted-foreground">Method:</span>
															<span>{student.instructionalMethod}</span>
														</div>
														<div className="grid grid-cols-2 gap-1 text-sm">
															<span className="text-muted-foreground">GPA:</span>
															<span>{student.overallGpa.toFixed(2)}</span>
														</div>
														<div className="grid grid-cols-2 gap-1 text-sm">
															<span className="text-muted-foreground">Email:</span>
															<span className="truncate">{student.email}</span>
														</div>
													</div>
												</CardContent>
											</Card>
										))
									) : (
										<div className="col-span-full text-center py-8">
											<p>No students found matching the current filters</p>
										</div>
									)}
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
				<Modal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					title={`Student Details - ${selectedStudentName}`}
					description={`Showing comprehensive details for M-Number: ${selectedMnumber || 'N/A'}`}
					// Adjust width as needed
					contentClassName="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl"
				>
					{selectedMnumber && (
						<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
					)}
				</Modal>
			</div>
		</div>
	);
};

export default CourseRosterPage;