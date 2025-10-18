import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Filter, Search, SortAsc, SortDesc, UserRound } from "lucide-react";
import { exportToCSV } from "@/utils/csv-export";
import { programs, students } from "@/db/schema";
import type { ExtendedCourse } from "@/components/selectors/course-selector";
import type { ExtendedTerm } from "@/components/selectors/course-selector";

type Program = typeof programs.$inferSelect;
type Student = typeof students.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


const rosterStudentsQuery = graphql(`
	query rosterStudentsQuery(
	$mnumber: String!
	$subject: String!
	$number: Int!
	$suffix: String!
	$section: String!
	) {
		instructorCoursesSingle(
			where: {
			mnumber: { eq: $mnumber }
			course_subject: { eq: $subject }
			course_number: { eq: $number }
			course_suffix: { eq: $suffix }
			course_section: { eq: $section }
			}
		) {
			term_code
			year
			course_subject
			course_number
			course_suffix
			course_section
			students {
				student {
					mnumber
					first_name
					middle_name
					last_name
					suffix
					email
					programs {
						program {
							description
							code
						}
					}
				}
			}
		}
	}
`);

const getGradeColorClass = (grade: string) => {
	if (grade === "N/A" || !grade) return "";
	if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-300";
	if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-300";
	if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
	if (grade.startsWith("D")) return "bg-orange-100 text-orange-800 border-orange-300";
	return "bg-red-100 text-red-800 border-red-300";
};

interface RosterProgram
	extends Omit<
		Program,
		| "cip_code"
		| "is_major"
		| "is_minor"
		| "has_concentration"
		| "is_discontinued"
		| "is_aacsb"
		| "department_code"
		| "college_code"
		| "last_updated"
	> { }

export interface RosterStudent
	extends Omit<
		Student,
		| "gender"
		| "birthdate"
		| "citizenship"
		| "race_code"
		| "race"
		| "residency"
		| "cell_phone"
	> {
	programs: RosterProgram[];
	midterm_grade?: string;
	final_grade?: string;
}

export interface RosterStudentsProps {
	mnumber: string;
	course: ExtendedCourse;
	term: ExtendedTerm;
	className?: string;
}

export function RosterStudents({ mnumber, course, term, className }: RosterStudentsProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [gradeFilter, setGradeFilter] = useState("all");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [sortField, setSortField] = useState<"name" | "midterm" | "final">("name");

	const exportFilename = `${course.course_subject}${course.course_number}${course.course_suffix}-${course.course_section}_${term.description}_${term.year}`;

	const { data, isLoading } = useQuery({
		queryKey: ['rosterStudentsQuery', course.course_subject, course.course_number, course.course_suffix, course.course_section],
		queryFn: async () => await execute(rosterStudentsQuery, {
			mnumber: mnumber,
			subject: course.course_subject,
			number: course.course_number,
			suffix: course.course_suffix,
			section: course.course_section,
		}),
	});

	if (isLoading) <Skeleton className="h-10 w-full" />;

	if (!data || !data.instructorCoursesSingle) return <div>No data available.</div>;

	// Map the data to RosterStudent format
	const students: RosterStudent[] = data.instructorCoursesSingle.students.map((sc) => ({
		mnumber: sc.student.mnumber,
		first_name: sc.student.first_name,
		middle_name: sc.student.middle_name || null,
		last_name: sc.student.last_name,
		suffix: sc.student.suffix || null,
		email: sc.student.email || null,
		programs: sc.student.programs
			?.filter((p): p is NonNullable<typeof sc.student.programs[number]> => p != null)
			.map((p) => p.program) ?? [],
	}));


	// Filter and sort students
	const filteredStudents = students
		.filter((student) => {
			const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
			const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
				student.mnumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
				student.email?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesGrade = gradeFilter === "all" ||
				student.final_grade?.startsWith(gradeFilter) ||
				(!student.final_grade && gradeFilter === "E");

			return matchesSearch && matchesGrade;
		})
		.sort((a, b) => {
			const multiplier = sortDirection === "asc" ? 1 : -1;

			if (sortField === "name") {
				const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
				const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
				return multiplier * nameA.localeCompare(nameB);
			} else if (sortField === "midterm") {
				const gradeA = a.midterm_grade || "Z";
				const gradeB = b.midterm_grade || "Z";
				return multiplier * gradeA.localeCompare(gradeB);
			} else {
				const gradeA = a.final_grade || "Z";
				const gradeB = b.final_grade || "Z";
				return multiplier * gradeA.localeCompare(gradeB);
			}
		});

	const handleHeaderClick = (field: "name" | "midterm" | "final") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	return (
		<Card className={className}>
			<CardHeader className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<CardTitle>Student Roster</CardTitle>
					<CardDescription>
						{filteredStudents.length} of {students.length} students
					</CardDescription>
				</div>
				<div className="flex flex-wrap gap-4">

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
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						onClick={() => {
							if (filteredStudents.length) {
								exportToCSV<RosterStudent>(filteredStudents, {
									filename: exportFilename,
									fields: [
										'mnumber',
										'first_name',
										'last_name',
										'middle_name',
										'suffix',
										'email',
										'programs',
										'midterm_grade',
										'final_grade',
									],
									headers: [
										'mnumber',
										'first_name',
										'last_name',
										'middle_name',
										'suffix',
										'email',
										'programs',
										'midterm_grade',
										'final_grade',
									], // these must match the fields. most likely didn't initially make it for the headers to be different.
									fieldTransformers: {
										programs: (value: Program[]) =>
											Array.isArray(value)
												? value.map((p) => `${p.code}: ${p.description}`).join(', ')
												: String(value),
									},
								});
							}
						}}
					>
						<Download className="mr-2 h-4 w-4" />
						Export as CSV
					</Button>
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
											onClick={() => handleHeaderClick("name")}
										>
											Student Name
											{sortField === "name" && (
												sortDirection === "asc" ? <SortAsc className="inline ml-2 h-4 w-4" /> :
													<SortDesc className="inline ml-2 h-4 w-4" />
											)}
										</TableHead>
										<TableHead>M-Number</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Major/Minor(s)</TableHead>
										<TableHead
											className="cursor-pointer"
											onClick={() => handleHeaderClick("midterm")}
										>
											Midterm Grade
											{sortField === "midterm" && (
												sortDirection === "asc" ? <SortAsc className="inline ml-2 h-4 w-4" /> :
													<SortDesc className="inline ml-2 h-4 w-4" />
											)}
										</TableHead>
										<TableHead
											className="cursor-table"
											onClick={() => handleHeaderClick("final")}
										>
											Final Grade
											{sortField === "final" && (
												sortDirection === "asc" ? <SortAsc className="inline ml-2 h-4 w-4" /> :
													<SortDesc className="inline ml-2 h-4 w-4" />
											)}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredStudents.map((student) => (
										<TableRow key={student.mnumber}>
											<TableCell className="font-medium">
												{student.last_name}, {student.first_name}
												{student.suffix && ` ${student.suffix}`}
											</TableCell>
											<TableCell>{student.mnumber}</TableCell>
											<TableCell>
												<a
													href={`mailto:${student.email?.toLowerCase()}`}
													className="hover:underline"
												>
													{student.email?.toLowerCase()}
												</a>
											</TableCell>
											<TableCell>
												{student.programs
													.map((program) => program.description)
													.join(", ") || "Undeclared"}
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={getGradeColorClass(student.midterm_grade || "N/A")}
												>
													{student.midterm_grade || "N/A"}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={getGradeColorClass(student.final_grade || "N/A")}
												>
													{student.final_grade || "N/A"}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</TabsContent>

					<TabsContent value="grid" className="max-w-full overflow-x-auto">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
							{filteredStudents.map((student) => (
								<Card key={student.mnumber} className="p-4">
									<CardHeader className="p-0">
										<div className="flex items-center gap-2">
											<UserRound className="h-6 w-6 text-muted-foreground" />
											<CardTitle className="text-lg">
												{student.last_name}, {student.first_name}
												{student.suffix && ` ${student.suffix}`}
											</CardTitle>
										</div>
										<CardDescription>{student.mnumber}</CardDescription>
									</CardHeader>
									<CardContent className="p-0 mt-2">
										<div className="space-y-2">
											<div>
												<span className="font-medium">Email: </span>
												<a
													href={`mailto:${student.email?.toLowerCase()}`}
													className="hover:underline"
												>
													{student.email?.toLowerCase()}
												</a>
											</div>
											<div>
												<span className="font-medium">Major/Minor(s): </span>
												{student.programs
													.map((program) => program.description)
													.join(", ") || "Undeclared"}
											</div>
											<div className="flex gap-2">
												<Badge
													variant="outline"
													className={getGradeColorClass(student.midterm_grade || "N/A")}
												>
													Mid: {student.midterm_grade || "N/A"}
												</Badge>
												<Badge
													variant="outline"
													className={getGradeColorClass(student.final_grade || "N/A")}
												>
													Final: {student.final_grade || "N/A"}
												</Badge>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};
