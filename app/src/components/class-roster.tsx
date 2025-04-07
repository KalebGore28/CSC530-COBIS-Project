"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Search, SortAsc, SortDesc } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// TypeScript interfaces
interface ClassIdentifier {
  subject: string
  number: string
  section: string
  term: string
  year: number
}

interface Student {
  mnumber: string
  first_name: string
  middle_name: string
  last_name: string
  email: string
  major: string
  academic_standing: string
  midterm_grade: number | null
  final_grade: number | null
  last_attendance: string | null
}

interface CourseInfo {
  subject: string
  number: string
  suffix: string
  section: string
  title: string
  hours: number
  instructor: string
  term: string
  year: number
  status: "Active" | "Completed"
  enrollment: number
  average_grade: number | null
}

interface ClassRosterProps {
  // New individual props
  subject?: string;
  number?: string;
  suffix?: string;
  section?: string;
  term?: string;
  year?: number;
}

// Helper function to convert numeric grade to letter grade
const getLetterGrade = (grade: number | null): string => {
  if (grade === null) return "N/A"
  if (grade >= 90) return "A"
  if (grade >= 80) return "B"
  if (grade >= 70) return "C"
  if (grade >= 60) return "D"
  return "F"
}

// Helper function to get grade distribution
const getGradeDistribution = (students: Student[]) => {
  const grades = students.map((s) => s.midterm_grade || s.final_grade).filter((g) => g !== null) as number[]

  const distribution = {
    A: grades.filter((g) => g >= 90).length,
    B: grades.filter((g) => g >= 80 && g < 90).length,
    C: grades.filter((g) => g >= 70 && g < 80).length,
    D: grades.filter((g) => g >= 60 && g < 70).length,
    F: grades.filter((g) => g < 60).length,
    total: grades.length,
  }

  return distribution
}

export default function ClassRoster({
  subject,
  number,
  suffix,
  section,
  term,
  year
}: ClassRosterProps) {
  // Parse the class identifier
  const [classIdentifier, setClassIdentifier] = useState<ClassIdentifier | null>(null)
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"name" | "grade">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [gradeFilter, setGradeFilter] = useState<string>("all")

  useEffect(() => {
    // Parse the class identifier - either from props or from classId
    const parseClassId = () => {
      try {
        // If individual props are provided, use those
        if (subject && number && section && term && year) {
          return {
            subject,
            number,
            suffix,
            section,
            term,
            year
          };
        }

        return null;
      } catch (error) {
        console.error("Invalid class identifier format:", error);
        return null;
      }
    };

    const fetchClassData = async () => {
      try {
        // Parse the class identifier
        const parsedId = parseClassId()
        if (!parsedId) {
          setLoading(false)
          return
        }

        setClassIdentifier(parsedId)

        // TODO: Replace with actual API call to fetch course and student data
        const courseData: CourseInfo = {
          subject: parsedId.subject,
          number: parsedId.number,
          suffix: "",
          section: parsedId.section,
          title: "",
          hours: 0,
          instructor: "",
          term: parsedId.term,
          year: parsedId.year,
          status: "Active",
          enrollment: 0,
          average_grade: null,
        }

        setCourseInfo(courseData)

        // TODO: Replace with actual API call to fetch student data
        const studentData: Student[] = []

        setStudents(studentData)
        setFilteredStudents(studentData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching class data:", error)
        setLoading(false)
      }
    }

    fetchClassData()
  }, [subject, number, section, term, year])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...students]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (student) =>
          student.first_name.toLowerCase().includes(query) ||
          student.last_name.toLowerCase().includes(query) ||
          student.mnumber.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.major.toLowerCase().includes(query),
      )
    }

    // Apply grade filter
    if (gradeFilter !== "all") {
      result = result.filter((student) => {
        const grade = student.final_grade || student.midterm_grade
        if (grade === null) return false

        switch (gradeFilter) {
          case "A":
            return grade >= 90
          case "B":
            return grade >= 80 && grade < 90
          case "C":
            return grade >= 70 && grade < 80
          case "D":
            return grade >= 60 && grade < 70
          case "F":
            return grade < 60
          default:
            return true
        }
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "name") {
        const nameA = `${a.last_name}, ${a.first_name}`
        const nameB = `${b.last_name}, ${b.first_name}`
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else {
        const gradeA = a.final_grade || a.midterm_grade || 0
        const gradeB = b.final_grade || b.midterm_grade || 0
        return sortDirection === "asc" ? gradeA - gradeB : gradeB - gradeA
      }
    })

    setFilteredStudents(result)
  }, [students, searchQuery, sortField, sortDirection, gradeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading class roster...</p>
        </div>
      </div>
    )
  }

  if (!classIdentifier || !courseInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
        </div>
      </div>
    )
  }

  const gradeDistribution = getGradeDistribution(students)
  const totalStudents = students.length

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="grid gap-6 max-w-6xl mx-auto">
        {/* Course Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {courseInfo.subject} {courseInfo.number}
                  {courseInfo.suffix} - {courseInfo.section}
                </h2>
                <p className="text-xl">{courseInfo.title}</p>
                <p className="text-muted-foreground">
                  {courseInfo.term} {courseInfo.year} • {courseInfo.hours} Credit Hours
                </p>
                <p className="text-muted-foreground">Instructor: {courseInfo.instructor}</p>
              </div>
              <div className="flex flex-col items-end justify-center">
                <Badge variant={courseInfo.status === "Active" ? "default" : "secondary"} className="mb-2">
                  {courseInfo.status}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Enrollment</p>
                  <p className="text-2xl font-bold">{courseInfo.enrollment} students</p>
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
                {courseInfo.status === "Active" ? "Current midterm grades" : "Final grades"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">A ({gradeDistribution.A} students)</span>
                    <span className="text-sm font-medium">
                      {totalStudents > 0 ? Math.round((gradeDistribution.A / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalStudents > 0 ? (gradeDistribution.A / totalStudents) * 100 : 0}
                    className="h-2 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">B ({gradeDistribution.B} students)</span>
                    <span className="text-sm font-medium">
                      {totalStudents > 0 ? Math.round((gradeDistribution.B / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalStudents > 0 ? (gradeDistribution.B / totalStudents) * 100 : 0}
                    className="h-2 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">C ({gradeDistribution.C} students)</span>
                    <span className="text-sm font-medium">
                      {totalStudents > 0 ? Math.round((gradeDistribution.C / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalStudents > 0 ? (gradeDistribution.C / totalStudents) * 100 : 0}
                    className="h-2 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">D ({gradeDistribution.D} students)</span>
                    <span className="text-sm font-medium">
                      {totalStudents > 0 ? Math.round((gradeDistribution.D / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalStudents > 0 ? (gradeDistribution.D / totalStudents) * 100 : 0}
                    className="h-2 bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">F ({gradeDistribution.F} students)</span>
                    <span className="text-sm font-medium">
                      {totalStudents > 0 ? Math.round((gradeDistribution.F / totalStudents) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalStudents > 0 ? (gradeDistribution.F / totalStudents) * 100 : 0}
                    className="h-2 bg-muted"
                  />
                </div>
              </div>
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
                    {courseInfo.average_grade !== null ? (
                      <>
                        {courseInfo.average_grade.toFixed(1)} ({getLetterGrade(courseInfo.average_grade)})
                      </>
                    ) : (
                      "N/A"
                    )}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Highest Grade:</dt>
                  <dd className="font-semibold">
                    {Math.max(...students.map((s) => s.final_grade || s.midterm_grade || 0)).toFixed(1)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Lowest Grade:</dt>
                  <dd className="font-semibold">
                    {Math.min(
                      ...students
                        .filter((s) => (s.final_grade || s.midterm_grade) !== null)
                        .map((s) => s.final_grade || s.midterm_grade || 0),
                    ).toFixed(1)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Students at Risk:</dt>
                  <dd className="font-semibold">
                    {students.filter((s) => (s.final_grade || s.midterm_grade || 0) < 70).length}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Total Students:</dt>
                  <dd className="font-semibold">{students.length}</dd>
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
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                            setSortField("name")
                            setSortDirection(sortField === "name" && sortDirection === "asc" ? "desc" : "asc")
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
                            setSortField("grade")
                            setSortDirection(sortField === "grade" && sortDirection === "asc" ? "desc" : "asc")
                          }}
                        >
                          {courseInfo.status === "Active" ? "Midterm Grade" : "Final Grade"}{" "}
                          {sortField === "grade" &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="inline h-4 w-4" />
                            ) : (
                              <SortDesc className="inline h-4 w-4" />
                            ))}
                        </TableHead>
                        <TableHead>Last Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {student.last_name}, {student.first_name}{" "}
                              {student.middle_name ? `${student.middle_name.charAt(0)}.` : ""}
                            </TableCell>
                            <TableCell>{student.mnumber}</TableCell>
                            <TableCell>{student.major}</TableCell>
                            <TableCell>
                              {courseInfo.status === "Active" ? (
                                student.midterm_grade !== null ? (
                                  <Badge
                                    className={
                                      student.midterm_grade >= 90
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : student.midterm_grade >= 80
                                          ? "bg-blue-100 text-blue-800 border-blue-300"
                                          : student.midterm_grade >= 70
                                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                            : "bg-red-100 text-red-800 border-red-300"
                                    }
                                  >
                                    {student.midterm_grade} ({getLetterGrade(student.midterm_grade)})
                                  </Badge>
                                ) : (
                                  "N/A"
                                )
                              ) : student.final_grade !== null ? (
                                <Badge
                                  className={
                                    student.final_grade >= 90
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : student.final_grade >= 80
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : student.final_grade >= 70
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                          : "bg-red-100 text-red-800 border-red-300"
                                  }
                                >
                                  {student.final_grade} ({getLetterGrade(student.final_grade)})
                                </Badge>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>{student.last_attendance || "N/A"}</TableCell>
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

              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {student.first_name} {student.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{student.mnumber}</p>
                              </div>
                              {courseInfo.status === "Active" ? (
                                student.midterm_grade !== null ? (
                                  <Badge
                                    className={
                                      student.midterm_grade >= 90
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : student.midterm_grade >= 80
                                          ? "bg-blue-100 text-blue-800 border-blue-300"
                                          : student.midterm_grade >= 70
                                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                            : "bg-red-100 text-red-800 border-red-300"
                                    }
                                  >
                                    {student.midterm_grade} ({getLetterGrade(student.midterm_grade)})
                                  </Badge>
                                ) : (
                                  "N/A"
                                )
                              ) : student.final_grade !== null ? (
                                <Badge
                                  className={
                                    student.final_grade >= 90
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : student.final_grade >= 80
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : student.final_grade >= 70
                                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                          : "bg-red-100 text-red-800 border-red-300"
                                  }
                                >
                                  {student.final_grade} ({getLetterGrade(student.final_grade)})
                                </Badge>
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              <span className="text-muted-foreground">Major:</span>
                              <span>{student.major}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              <span className="text-muted-foreground">Standing:</span>
                              <span>{student.academic_standing}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-sm">
                              <span className="text-muted-foreground">Last Attendance:</span>
                              <span>{student.last_attendance || "N/A"}</span>
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
      </div>
    </div>
  )
}

