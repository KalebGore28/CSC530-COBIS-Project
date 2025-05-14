import { Student, Program } from "@cobis/types";
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
	SelectValue
} from "@/components/ui/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/common/export-button";
import {
	Filter,
	Search,
	SortAsc,
	SortDesc,
	UserRound
} from "lucide-react";

// Import types
import type { ExtendedCourse } from "@/components/selectors/course-selector";

const getGradeColorClass = (grade: string) => {
	if (grade === "N/A" || null) return "";
	if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-300";
	if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-300";
	if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
	if (grade.startsWith("D")) return "bg-orange-100 text-orange-800 border-orange-300";
	return "bg-red-100 text-red-800 border-red-300";
};

interface RosterProgram
	extends Omit<Program,
		"cip_code" |
		"is_major" |
		"is_minor" |
		"has_concentration" |
		"is_discontinued" |
		"is_aacsb" |
		"department" |
		"college" |
		"added_on"
	> { }

export interface RosterStudent
	extends Omit<Student,
		"gender" |
		"birthdate" |
		"citizenship" |
		"race_code" |
		"race_description" |
		"residency_code" |
		"residency_description" |
		"age" |
		"cell_phone"
	> {
	programs: RosterProgram[];

}

export interface RosterStudentsProps {
	students: RosterStudent[];
	course: ExtendedCourse;
}

export const RosterStudents: React.FC<RosterStudentsProps> = ({ students, course }) => {

	const exportFilename = `${course.subject}${course.number}${course.suffix}-${course.course_section}_${course.term.description}_${course.term.year}`;

	return (
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
										>
											Student Name
										</TableHead>
										<TableHead>M-Number</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Major</TableHead>
										<TableHead
											className="cursor-pointer"
										>
											Midterm Grade

										</TableHead>
										<TableHead
											className="cursor-pointer"

										>
											Final Grade

										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>

								</TableBody>
							</Table>
						</div>
					</TabsContent>

					<TabsContent value="grid" className="max-w-full overflow-x-auto">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
