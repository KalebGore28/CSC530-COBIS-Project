"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { AlertCircle, Filter, Search, SortAsc, SortDesc, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/components/selectors/course-selector";
import { SkeletonCard } from "@/components/loading/selector-skeleton";
import { ExportButton } from "@/components/common/export-button";
import { PieChartDonut } from "@/components/charts/pie-chart-donut";
import { gql } from "graphql-request";
import { fetchGraphQL } from "@/utils/fetch-graphql";

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
	averageGradeValue: number;
}

type CurrentTermResponse = {
	year: number;
	term: {
		code: string;
		description: string;
	};
};

/**
 * Props for the ClassRosterComponent
 */
export interface ClassRosterProps {
	mnumber: string | null;
	selectedCourse: Course;
	onStudentSelect?: (student: Student) => void;
}

const GET_CURRENT_TERM = gql`
	query GetCurrentTerm {
		getCurrentYearTerm {
			year
			term {
			code
			description
			}
		}
	}
`;

const GET_CLASS_ROSTER = gql`
query GetClassRoster(
  $mnumber: String!
  $subject: String!
  $number: Int!
  $suffix: String
  $section: String!
  $startTerm: String!
  $startYear: Int!
) {
  instructor(mnumber: $mnumber) {
    courses_taught(
      subject: $subject
      number: $number
      suffix: $suffix
      section: $section
      startTerm: $startTerm
      endTerm: $startTerm
      startYear: $startYear
      endYear: $startYear
    ) {
      course {
        subject
        number
        suffix
        title
      }
      course_section
      crn
      term {
        code
        description
      }
      students {
        mnumber
        student {
          first_name
          middle_name
          last_name
          suffix
          email
          programs {
            program {
              code
            }
          }
          academic_info(term: $startTerm, year: $startYear) {
            overall_gpa
            overall_earned_hours
          }
        }
        final_grade
        midterm_grade
        registration_status {
          code
          description
        }
        instructional_method {
          code
          description
        }
        last_attendance
      }
    }
  }
}
`;




/**
 * Roster
 * 
 * Displays a class roster for a specific course
 */
export const Roster: React.FC<ClassRosterProps> = ({
	mnumber,
	selectedCourse,
}) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [courseInfo, setRosterCourse] = useState<RosterCourse | null>(null);
	const [students, setStudents] = useState<Student[]>([]);
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
	const [stats, setStats] = useState<RosterStats | null>(null);
	const [currentTerm, setCurrentTerm] = useState<CurrentTermResponse | null>(null);

	// Filters and sorting
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState<"name" | "grade">("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [gradeFilter, setGradeFilter] = useState<string>("all");
	const [gradeType, setGradeType] = useState<"final" | "midterm">("final");

	const gradeDistributionFromStudents = useMemo(() => {
		return students.reduce((acc, student) => {
			const grade = gradeType === "final"
				? student.finalGrade
				: student.midtermGrade;
			if (grade === "N/A") return acc;
			acc[grade] = (acc[grade] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	}, [students, gradeType]);

	const chartData = useMemo(
		() =>
			Object.entries(gradeDistributionFromStudents).map(
				([grade, count]) => ({ grade, count })
			),
		[gradeDistributionFromStudents]
	);

	useEffect(() => {
		const fetchRosterData = async () => {
			if (!mnumber || !selectedCourse) return;

			setLoading(true);
			setError(null);

			try {
				// 1️⃣ Load “current term” to mark Active/Completed
				const termData = await fetchGraphQL(GET_CURRENT_TERM, {});
				setCurrentTerm(termData.getCurrentYearTerm as CurrentTermResponse);

				// 2️⃣ Load roster via GraphQL
				const data = await fetchGraphQL(GET_CLASS_ROSTER, {
					mnumber,
					subject: selectedCourse.courseSubject,
					number: selectedCourse.courseNumber,
					suffix: selectedCourse.courseSuffix || null,
					section: selectedCourse.courseSection,
					startTerm: selectedCourse.termCode,
					startYear: selectedCourse.year,
				});

				// unwrap the array — should be length 1
				const taught = data.instructor.courses_taught as any[];
				if (!taught.length) {
					throw new Error("No matching course found for this term");
				}

				const node = taught[0];

				// 3️⃣ Set course info
				setRosterCourse({
					courseId: `${node.course.subject}${node.course.number}${node.course.suffix}`,
					courseSubject: node.course.subject,
					courseNumber: String(node.course.number),
					courseSuffix: node.course.suffix,
					courseSection: node.course_section,
					courseTitle: node.course.title,
					termCode: node.term.code,
					termName: node.term.description,
					year: selectedCourse.year,
					creditHours: selectedCourse.creditHours,
				});

				// inside your fetchRosterData after `const node = taught[0];`

				// 4️⃣ Normalize students
				const normalized: Student[] = node.students.map((s: any) => {
					// coerce nulls → "N/A"
					const final = s.final_grade ?? "N/A";
					const midt = s.midterm_grade ?? "N/A";

					const info = s.student.academic_info || [];
					const progList = s.student.programs || [];
					const majorCode = progList.length > 0
						? progList[0].program.code
						: "Undeclared";

					return {
						mnumber: s.mnumber,
						firstName: s.student.first_name,
						middleName: s.student.middle_name,
						lastName: s.student.last_name,
						suffix: s.student.suffix,
						name: `${s.student.first_name} ${s.student.last_name}`,
						email: s.student.email || "N/A",
						major: majorCode,
						finalGrade: final,
						midtermGrade: midt,
						registrationStatus: s.registration_status.description,
						instructionalMethod: s.instructional_method.description,
						lastAttendance: s.last_attendance,
						overallGpa: info[0]?.overall_gpa ?? 0,
						overallEarnedHours: info[0]?.overall_earned_hours ?? 0,
					};
				});



				setStudents(normalized);
				setFilteredStudents(normalized);

				// 5️⃣ Compute stats
				const totalStudents = normalized.length;

				// build your distribution directly:
				const dist = normalized.reduce((acc, st) => {
					const g = st.finalGrade === "N/A" ? st.midtermGrade : st.finalGrade;
					if (g !== "N/A") {
						acc[g] = (acc[g] || 0) + 1;
					}
					return acc;
				}, {} as Record<string, number>);

				const totalGraded = Object.values(dist).reduce((sum, c) => sum + c, 0);

				const overallGpa = totalStudents
					? normalized.reduce((sum, st) => sum + st.overallGpa, 0) / totalStudents
					: 0;

				// now average on a 0–4 scale:
				const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
				const averageGradeValue = totalGraded
					? Object.entries(dist).reduce((sum, [grade, count]) => {
						const pts = GRADE_POINTS[grade] ?? 0;
						return sum + pts * count;
					}, 0) / totalGraded
					: 0;

				setStats({
					totalStudents,
					totalGraded,
					overallGpa,
					gradeDistribution: dist,
					averageGradeValue,
				});
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Failed to load class roster");
			} finally {
				setLoading(false);
			}
		};

		fetchRosterData();
	}, [mnumber, selectedCourse]);


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
		if (grade === "N/A" || null) return "";
		if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-300";
		if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-300";
		if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
		if (grade.startsWith("D")) return "bg-orange-100 text-orange-800 border-orange-300";
		return "bg-red-100 text-red-800 border-red-300";
	};

	if (loading) {
		return <SkeletonCard showTitle showDescription lines={5} />;
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
			</Card>
		);
	}

	const exportFilename = `${courseInfo.courseSubject}${courseInfo.courseNumber}${courseInfo.courseSuffix}-${courseInfo.courseSection}_${courseInfo.termName}_${courseInfo.year}`;

	const isActive = currentTerm?.term.code === courseInfo.termCode && currentTerm?.year === courseInfo.year;

	return (
		<div className="space-y-6 w-full">
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
					<CardHeader className="flex items-center justify-between">
						<CardTitle>Grade Distributions</CardTitle>
						<div className="space-x-2">
							<Button
								size="sm"
								variant={gradeType === "midterm" ? "default" : "outline"}
								onClick={() => setGradeType("midterm")}
							>
								Midterm
							</Button>
							<Button
								size="sm"
								variant={gradeType === "final" ? "default" : "outline"}
								onClick={() => setGradeType("final")}
							>
								Final
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<PieChartDonut
							title={`${gradeType === "final" ? "Final" : "Midterm"} Grade Distributions`}
							description={`${gradeType === "final" ? "Final" : "Midterm"} Grades`}
							data={chartData}
						/>
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
								<dt className="font-medium text-muted-foreground">Average GPA:</dt>
								<dd className="font-semibold">
									{stats.overallGpa.toFixed(2)}
								</dd>
							</div>
							<div className="grid grid-cols-2 gap-1">
								<dt className="font-medium text-muted-foreground">Average Grade:</dt>
								<dd className="font-semibold">
									{stats.totalGraded > 0
										? stats.averageGradeValue.toFixed(2)
										: "N/A"}
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
								<SelectTrigger className="w-full sm:w-40">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Filter" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Grades</SelectItem>
									<SelectItem value="A">A</SelectItem>
									<SelectItem value="B">B</SelectItem>
									<SelectItem value="C">C</SelectItem>
									<SelectItem value="D">D</SelectItem>
									<SelectItem value="E">E</SelectItem>
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
											<TableHead>Email</TableHead>
											<TableHead>Major</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setSortField("grade");
													setSortDirection(sortField === "grade" && sortDirection === "asc" ? "desc" : "asc");
												}}
											>
												Midterm Grade
												{sortField === "grade" &&
													(sortDirection === "asc" ? (
														<SortAsc className="inline h-4 w-4" />
													) : (
														<SortDesc className="inline h-4 w-4" />
													))}
											</TableHead>
											<TableHead
												className="cursor-pointer"
												onClick={() => {
													setSortField("grade");
													setSortDirection(sortField === "grade" && sortDirection === "asc" ? "desc" : "asc");
												}}
											>
												Final Grade
												{sortField === "grade" &&
													(sortDirection === "asc" ? (
														<SortAsc className="inline h-4 w-4" />
													) : (
														<SortDesc className="inline h-4 w-4" />
													))}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredStudents.length > 0 ? (
											filteredStudents.map((student, index) => (
												<TableRow
													key={index}
													className="group cursor-pointer">
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
													<TableCell>
														<a
															href={`mailto:${student.email.toLowerCase()}`}
															className="text-blue-600 hover:underline"
														>
															{student.email.toLowerCase()}
														</a>
													</TableCell>
													<TableCell>{student.major}</TableCell>
													<TableCell>
														<Badge className={getGradeColorClass(student.midtermGrade)}>
															{student.midtermGrade}
														</Badge>
													</TableCell>
													<TableCell>
														<Badge className={getGradeColorClass(student.finalGrade)}>
															{student.finalGrade}
														</Badge>
													</TableCell>
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
														<Badge className={getGradeColorClass(student.midtermGrade)}>
															MG: {student.midtermGrade}
														</Badge>
														<Badge className={getGradeColorClass(student.finalGrade)}>
															FG: {student.finalGrade}
														</Badge>
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
														<span className="text-muted-foreground">Email:</span>
														<a
															href={`mailto:${student.email.toLowerCase()}`}
															className="text-blue-600 hover:underline"
														>
															{student.email.toLowerCase()}
														</a>
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
		</div>
	);
};

export default Roster;