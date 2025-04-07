"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// TypeScript interfaces based on the database schema
interface Student {
  mnumber: string
  first_name: string
  middle_name: string
  last_name: string
  gender: string
  birthdate: string
  age: number
  cell_phone: string
  email: string // From user table
}

interface StudentAcademicInfo {
  admit_term: string
  admit_year: number
  admit_code: string
  academic_standing: string
  msu_attempted_hours: number
  msu_earned_hours: number
  msu_quality_points: number
  msu_gpa: number
  overall_attempted_hours: number
  overall_earned_hours: number
  overall_quality_points: number
  overall_gpa: number
}

interface StudentProgram {
  term: string
  year: number
  study: string
  type: string
  level: string
  program: string
  program_description: string // From programs table
  department: string
  college: string
}

interface StudentCourse {
  term: string
  year: number
  part_of_term: string
  crn: string
  course_subject: string
  course_number: string
  course_suffix: string
  course_section: string
  course_hours: number
  course_level: string
  registration_status: string
  instructional_method: string
  last_attendance: string | null
  midterm_grade: number | null
  final_grade: number | null
  course_title: string // From courses table
  letter_grade: string // Calculated from final_grade
}

interface StudentPageProps {
  mNumber: string
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

export default function StudentPage({ mNumber }: StudentPageProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [academicInfo, setAcademicInfo] = useState<StudentAcademicInfo | null>(null)
  const [programs, setPrograms] = useState<StudentProgram[]>([])
  const [currentCourses, setCurrentCourses] = useState<StudentCourse[]>([])
  const [previousCourses, setPreviousCourses] = useState<StudentCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Placeholder student data
        setStudent({
          mnumber: mNumber,
          first_name: "John",
          middle_name: "M",
          last_name: "Doe",
          gender: "M",
          birthdate: "2000-05-15",
          age: 24,
          cell_phone: "(555) 123-4567",
          email: "jdoe@murraystate.edu",
        })

        // Placeholder academic info
        setAcademicInfo({
          admit_term: "Fall",
          admit_year: 2022,
          admit_code: "FR",
          academic_standing: "Good Standing",
          msu_attempted_hours: 45,
          msu_earned_hours: 42,
          msu_quality_points: 151.2,
          msu_gpa: 3.6,
          overall_attempted_hours: 45,
          overall_earned_hours: 42,
          overall_quality_points: 151.2,
          overall_gpa: 3.6,
        })

        // Placeholder programs (major/minor)
        setPrograms([
          {
            term: "Spring",
            year: 2025,
            study: "Undergraduate",
            type: "Major",
            level: "Bachelor",
            program: "CSCI",
            program_description: "Computer Science",
            department: "Computer Science",
            college: "College of Science",
          },
          {
            term: "Spring",
            year: 2025,
            study: "Undergraduate",
            type: "Minor",
            level: "Bachelor",
            program: "MATH",
            program_description: "Mathematics",
            department: "Mathematics",
            college: "College of Science",
          },
        ])

        // Placeholder current courses
        setCurrentCourses([
          {
            term: "Spring",
            year: 2025,
            part_of_term: "Full Term",
            crn: "12345",
            course_subject: "CS",
            course_number: "350",
            course_suffix: "",
            course_section: "001",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Registered",
            instructional_method: "In Person",
            last_attendance: null,
            midterm_grade: 88,
            final_grade: null,
            course_title: "Software Engineering",
            letter_grade: "B",
          },
          {
            term: "Spring",
            year: 2025,
            part_of_term: "Full Term",
            crn: "12346",
            course_subject: "CS",
            course_number: "430",
            course_suffix: "",
            course_section: "001",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Registered",
            instructional_method: "In Person",
            last_attendance: null,
            midterm_grade: 92,
            final_grade: null,
            course_title: "Database Systems",
            letter_grade: "A",
          },
          {
            term: "Spring",
            year: 2025,
            part_of_term: "Full Term",
            crn: "12347",
            course_subject: "MATH",
            course_number: "310",
            course_suffix: "",
            course_section: "002",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Registered",
            instructional_method: "In Person",
            last_attendance: null,
            midterm_grade: 85,
            final_grade: null,
            course_title: "Discrete Mathematics",
            letter_grade: "B",
          },
          {
            term: "Spring",
            year: 2025,
            part_of_term: "Full Term",
            crn: "12348",
            course_subject: "ENG",
            course_number: "210",
            course_suffix: "",
            course_section: "003",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Registered",
            instructional_method: "Online",
            last_attendance: null,
            midterm_grade: 90,
            final_grade: null,
            course_title: "Technical Writing",
            letter_grade: "A",
          },
        ])

        // Placeholder previous courses
        setPreviousCourses([
          {
            term: "Fall",
            year: 2024,
            part_of_term: "Full Term",
            crn: "10001",
            course_subject: "CS",
            course_number: "240",
            course_suffix: "",
            course_section: "001",
            course_hours: 4,
            course_level: "UG",
            registration_status: "Completed",
            instructional_method: "In Person",
            last_attendance: "2024-12-15",
            midterm_grade: 88,
            final_grade: 91,
            course_title: "Data Structures",
            letter_grade: "A",
          },
          {
            term: "Fall",
            year: 2024,
            part_of_term: "Full Term",
            crn: "10002",
            course_subject: "CS",
            course_number: "280",
            course_suffix: "",
            course_section: "002",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Completed",
            instructional_method: "In Person",
            last_attendance: "2024-12-15",
            midterm_grade: 78,
            final_grade: 82,
            course_title: "Computer Organization",
            letter_grade: "B",
          },
          {
            term: "Fall",
            year: 2024,
            part_of_term: "Full Term",
            crn: "10003",
            course_subject: "MATH",
            course_number: "230",
            course_suffix: "",
            course_section: "001",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Completed",
            instructional_method: "In Person",
            last_attendance: "2024-12-15",
            midterm_grade: 92,
            final_grade: 94,
            course_title: "Calculus II",
            letter_grade: "A",
          },
          {
            term: "Spring",
            year: 2024,
            part_of_term: "Full Term",
            crn: "20001",
            course_subject: "CS",
            course_number: "101",
            course_suffix: "",
            course_section: "001",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Completed",
            instructional_method: "In Person",
            last_attendance: "2024-05-10",
            midterm_grade: 95,
            final_grade: 96,
            course_title: "Introduction to Programming",
            letter_grade: "A",
          },
          {
            term: "Spring",
            year: 2024,
            part_of_term: "Full Term",
            crn: "20002",
            course_subject: "MATH",
            course_number: "150",
            course_suffix: "",
            course_section: "002",
            course_hours: 3,
            course_level: "UG",
            registration_status: "Completed",
            instructional_method: "In Person",
            last_attendance: "2024-05-10",
            midterm_grade: 88,
            final_grade: 85,
            course_title: "Calculus I",
            letter_grade: "B",
          },
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching student data:", error)
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [mNumber])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading student information...</p>
        </div>
      </div>
    )
  }

  if (!student || !academicInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Student Not Found</h2>
          <p className="mt-2 text-muted-foreground">No student found with M-Number: {mNumber}</p>
        </div>
      </div>
    )
  }

  // Calculate current semester credit hours
  const currentSemesterHours = currentCourses.reduce((total, course) => total + course.course_hours, 0)

  // Calculate current semester GPA based on midterm grades
  const currentSemesterPoints = currentCourses.reduce((total, course) => {
    if (course.midterm_grade === null) return total
    const gradePoint =
      course.midterm_grade >= 90
        ? 4.0
        : course.midterm_grade >= 80
          ? 3.0
          : course.midterm_grade >= 70
            ? 2.0
            : course.midterm_grade >= 60
              ? 1.0
              : 0.0
    return total + gradePoint * course.course_hours
  }, 0)

  const currentSemesterGPA =
    currentSemesterHours > 0 ? (currentSemesterPoints / currentSemesterHours).toFixed(2) : "N/A"

  return (
    <div className="container py-8 max-w-6xl">
      <div className="grid gap-6">
        {/* Student Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {student.first_name} {student.middle_name ? `${student.middle_name.charAt(0)}. ` : ""}
                  {student.last_name}
                </h2>
                <p className="text-muted-foreground">
                  {programs.find((p) => p.type === "Major")?.program_description || "Undeclared"} Student
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>M-Number:</span> {student.mnumber}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Email:</span> {student.email}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Phone:</span> {student.cell_phone}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall GPA</span>
                    <span className="text-sm font-medium">{academicInfo.overall_gpa.toFixed(2)}</span>
                  </div>
                  <Progress value={academicInfo.overall_gpa * 25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current GPA</span>
                    <span className="text-sm font-medium">{currentSemesterGPA}</span>
                  </div>
                  <Progress
                    value={currentSemesterGPA !== "N/A" ? Number.parseFloat(currentSemesterGPA) * 25 : 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Credit Hours</span>
                    <span className="text-sm font-medium">
                      {academicInfo.overall_earned_hours} / {academicInfo.overall_attempted_hours}
                    </span>
                  </div>
                  <Progress
                    value={(academicInfo.overall_earned_hours / academicInfo.overall_attempted_hours) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Academic Standing:</dt>
                  <dd>{academicInfo.academic_standing}</dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Admit Term:</dt>
                  <dd>
                    {academicInfo.admit_term} {academicInfo.admit_year}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Overall GPA:</dt>
                  <dd>{academicInfo.overall_gpa.toFixed(2)}</dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Earned Hours:</dt>
                  <dd>{academicInfo.overall_earned_hours}</dd>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <dt className="font-medium text-muted-foreground">Attempted Hours:</dt>
                  <dd>{academicInfo.overall_attempted_hours}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programs.map((program, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold">
                      {program.type}: {program.program_description}
                    </h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="grid grid-cols-2 gap-1">
                        <dt className="font-medium text-muted-foreground">Program:</dt>
                        <dd>
                          {program.program} ({program.program_description})
                        </dd>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <dt className="font-medium text-muted-foreground">Department:</dt>
                        <dd>{program.department}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <dt className="font-medium text-muted-foreground">College:</dt>
                        <dd>{program.college}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <dt className="font-medium text-muted-foreground">Level:</dt>
                        <dd>{program.level}</dd>
                      </div>
                    </dl>
                    {index < programs.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                {programs.length === 0 && <p className="text-muted-foreground">No program information available</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Information Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="current">Current Courses</TabsTrigger>
            <TabsTrigger value="previous">Course History</TabsTrigger>
          </TabsList>

          {/* Current Courses Tab */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Current Courses</CardTitle>
                <CardDescription>
                  Spring 2025 - {currentSemesterHours} Credit Hours - Current GPA: {currentSemesterGPA}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Midterm</TableHead>
                      <TableHead>Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {course.course_subject} {course.course_number}
                            {course.course_suffix}
                          </TableCell>
                          <TableCell>{course.course_title}</TableCell>
                          <TableCell>{course.course_section}</TableCell>
                          <TableCell>{course.course_hours}</TableCell>
                          <TableCell>
                            {course.midterm_grade !== null ? (
                              <Badge
                                variant="outline"
                                className={
                                  course.midterm_grade >= 90
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : course.midterm_grade >= 80
                                      ? "bg-blue-100 text-blue-500 border-blue-300"
                                      : course.midterm_grade >= 70
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : "bg-red-100 text-red-800 border-red-300"
                                }
                              >
                                {course.midterm_grade} ({getLetterGrade(course.midterm_grade)})
                              </Badge>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {course.final_grade !== null ? (
                              <Badge variant="outline" className="font-medium">
                                {course.final_grade} ({getLetterGrade(course.final_grade)})
                              </Badge>
                            ) : (
                              "In Progress"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No current courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Previous Courses Tab */}
          <TabsContent value="previous">
            <Card>
              <CardHeader>
                <CardTitle>Course History</CardTitle>
                <CardDescription>Previous courses and grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Group previous courses by term and year */}
                  {Array.from(new Set(previousCourses.map((course) => `${course.term} ${course.year}`))).map(
                    (termYear) => {
                      const termCourses = previousCourses.filter(
                        (course) => `${course.term} ${course.year}` === termYear,
                      )
                      const termHours = termCourses.reduce((total, course) => total + course.course_hours, 0)

                      // Calculate term GPA
                      const termPoints = termCourses.reduce((total, course) => {
                        if (course.final_grade === null) return total
                        const gradePoint =
                          course.final_grade >= 90
                            ? 4.0
                            : course.final_grade >= 80
                              ? 3.0
                              : course.final_grade >= 70
                                ? 2.0
                                : course.final_grade >= 60
                                  ? 1.0
                                  : 0.0
                        return total + gradePoint * course.course_hours
                      }, 0)

                      const termGPA = termHours > 0 ? (termPoints / termHours).toFixed(2) : "N/A"

                      return (
                        <div key={termYear} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{termYear}</h3>
                            <div className="text-sm text-muted-foreground">
                              {termHours} Credit Hours | GPA: {termGPA}
                            </div>
                          </div>
                          <Separator />
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Grade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {termCourses.map((course, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {course.course_subject} {course.course_number}
                                    {course.course_suffix}
                                  </TableCell>
                                  <TableCell>{course.course_title}</TableCell>
                                  <TableCell>{course.course_section}</TableCell>
                                  <TableCell>{course.course_hours}</TableCell>
                                  <TableCell>
                                    {course.final_grade !== null ? (
                                      <Badge
                                        variant={
                                          course.final_grade >= 90
                                            ? "default"
                                            : course.final_grade >= 80
                                              ? "outline"
                                              : course.final_grade >= 70
                                                ? "secondary"
                                                : course.final_grade >= 60
                                                  ? "destructive"
                                                  : "destructive"
                                        }
                                        className={
                                          course.final_grade >= 90
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : course.final_grade >= 80
                                              ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100"
                                              : course.final_grade >= 70
                                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                : "bg-red-100 text-red-800 hover:bg-red-100"
                                        }
                                      >
                                        {course.final_grade} ({getLetterGrade(course.final_grade)})
                                      </Badge>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )
                    },
                  )}

                  {previousCourses.length === 0 && (
                    <div className="text-center py-4">
                      <p>No previous courses found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Academic Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Summary</CardTitle>
            <CardDescription>Overview of academic progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Total Courses Completed</h3>
                <p className="text-3xl font-bold">{previousCourses.length}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Current Semester Hours</h3>
                <p className="text-3xl font-bold">{currentSemesterHours}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Overall GPA</h3>
                <p className="text-3xl font-bold">{academicInfo.overall_gpa.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

