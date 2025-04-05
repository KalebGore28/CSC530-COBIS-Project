"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, Users, BookOpen, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Types for API responses
interface Instructor {
  mnumber: string
  name: string
  firstName: string
  lastName: string
  department: string
  departmentCode: string
  college: string
  collegeCode: string
  email?: string
  image?: string
}

interface InstructorBasicInfo {
  mnumber: string
  instructorInfo: {
    name: string
    firstName: string
    lastName: string
    department: string
    departmentCode: string
    college: string
    collegeCode: string
    email?: string
    image?: string
  }
}

interface CurrentStatus {
  mnumber: string
  currentStatus: {
    currentTerm: string
    currentYear: number
    isCurrentlyTeaching: boolean
    currentCourseCount: number
  }
}

interface TeachingSummary {
  mnumber: string
  teachingSummary: {
    totalCoursesTaught: number
    uniqueCoursesTaught: number
    totalStudentsTaught: number
    totalCreditHoursDelivered: number
    averageClassSize: number
    mostTaughtCourses: Array<{
      courseId: string
      courseTitle: string
      timesTaught: number
    }>
  }
}

// Update CourseDetails interface to match the actual API structure
interface Course {
  termName: string
  termCode: string
  year: number
  courseId: string
  courseTitle: string
  courseSubject: string
  courseNumber: string
  courseSuffix: string
  crn: string
  section?: string
  creditHours: number
  studentCount: number
  totalCreditHours?: number
  instructionalMethod?: string
}

interface CourseDetails {
  mnumber: string
  courseDetails: Course[]
}

interface TermSummary {
  termCode: string
  termName: string
  year: number
  courseCount: number
  totalStudents: number
  totalCreditHours: number
}

interface TermSummaries {
  mnumber: string
  termSummaries: TermSummary[]
}

// Group structure for instructors by department
interface DepartmentGroup {
  departmentCode: string
  department: string
  instructors: Instructor[]
}

const ProfessorTeachingInfo = () => {
  // State variables
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [departments, setDepartments] = useState<DepartmentGroup[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [expandedProfessor, setExpandedProfessor] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [instructorDetailsLoading, setInstructorDetailsLoading] = useState<boolean>(false)

  // State for instructor details
  const [basicInfo, setBasicInfo] = useState<InstructorBasicInfo | null>(null)
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null)
  const [teachingSummary, setTeachingSummary] = useState<TeachingSummary | null>(null)
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null)
  const [termSummaries, setTermSummaries] = useState<TermSummaries | null>(null)
  const [allCourses, setAllCourses] = useState<CourseDetails | null>(null)

  // Load instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/instructor')

        if (!response.ok) {
          throw new Error(`Failed to fetch instructors: ${response.status}`)
        }

        const instructorsData: Instructor[] = await response.json()

        // Group instructors by department
        const departmentGroups: DepartmentGroup[] = []

        instructorsData.forEach(instructor => {
          const existingDept = departmentGroups.find(
            dept => dept.departmentCode === instructor.departmentCode
          )

          if (existingDept) {
            existingDept.instructors.push(instructor)
          } else {
            departmentGroups.push({
              departmentCode: instructor.departmentCode,
              department: instructor.department,
              instructors: [instructor]
            })
          }
        })

        // Sort departments alphabetically
        departmentGroups.sort((a, b) => a.department.localeCompare(b.department))

        setInstructors(instructorsData)
        setDepartments(departmentGroups)

        // Set default department if available
        if (departmentGroups.length > 0) {
          setSelectedDepartment(departmentGroups[0].departmentCode)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching instructors:", error)
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  // Toggle professor expansion and fetch additional data
  const toggleProfessor = async (professorId: string) => {
    if (expandedProfessor === professorId) {
      setExpandedProfessor(null)
      return
    }

    setExpandedProfessor(professorId)
    setInstructorDetailsLoading(true)

    try {
      // First fetch basic info and current status
      const [basicInfoRes, currentStatusRes] = await Promise.all([
        fetch(`/api/instructor/${professorId}`).then(res => {
          if (!res.ok) throw new Error(`Error fetching instructor basic info: ${res.status}`)
          return res.json()
        }),
        fetch(`/api/instructor/${professorId}/current-status`).then(res => {
          if (!res.ok) throw new Error(`Error fetching current status: ${res.status}`)
          return res.json()
        })
      ])

      // Set the initial data
      setBasicInfo(basicInfoRes)
      setCurrentStatus(currentStatusRes)

      // Now fetch the rest using the current status to filter courses
      const currentTerm = currentStatusRes.currentStatus.currentTermCode
      const currentYear = currentStatusRes.currentStatus.currentYear

      // Fetch remaining data
      const [teachingSummaryRes, courseDetailsRes, termSummariesRes] = await Promise.all([
        fetch(`/api/instructor/${professorId}/teaching-summary`).then(res => {
          if (!res.ok) throw new Error(`Error fetching teaching summary: ${res.status}`)
          return res.json()
        }),
        fetch(`/api/instructor/${professorId}/courses?term=${currentTerm}&year=${currentYear}`).then(res => {
          if (!res.ok) throw new Error(`Error fetching course details: ${res.status}`)
          return res.json()
        }),
        fetch(`/api/instructor/${professorId}/terms`).then(res => {
          if (!res.ok) throw new Error(`Error fetching term summaries: ${res.status}`)
          return res.json()
        })
      ])

      setTeachingSummary(teachingSummaryRes)
      setCourseDetails(courseDetailsRes)
      setTermSummaries(termSummariesRes)

      // Also fetch all courses for historical view
      const allCoursesRes = await fetch(`/api/instructor/${professorId}/courses`).then(res => {
        if (!res.ok) throw new Error(`Error fetching all course details: ${res.status}`)
        return res.json()
      })

      // Store all historical courses for the history tab
      setAllCourses(allCoursesRes)

    } catch (error) {
      console.error("Error fetching instructor details:", error)
      // Reset loading state but keep expanded to show error message
    } finally {
      setInstructorDetailsLoading(false)
    }
  }

  // Filter instructors by selected department
  const selectedDeptInstructors = selectedDepartment
    ? instructors.filter(instructor => instructor.departmentCode === selectedDepartment)
    : []

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Professor Teaching Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Department</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.departmentCode} value={dept.departmentCode}>
                    {dept.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professor List */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : selectedDepartment && selectedDeptInstructors.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professors</h3>
              <div className="border rounded-md divide-y">
                {selectedDeptInstructors.map((instructor) => (
                  <div key={instructor.mnumber} className="divide-y">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleProfessor(instructor.mnumber)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{instructor.name}</div>
                        <div className="text-sm text-muted-foreground">{instructor.department}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {instructor.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${instructor.email}`}>Contact</a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          {expandedProfessor === instructor.mnumber ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Information */}
                    {expandedProfessor === instructor.mnumber && (
                      <div className="p-4 bg-muted/20">
                        {instructorDetailsLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                          </div>
                        ) : (
                          <Tabs defaultValue="current">
                            <TabsList className="mb-4">
                              <TabsTrigger value="current">Current Teaching</TabsTrigger>
                              <TabsTrigger value="summary">Teaching Summary</TabsTrigger>
                              <TabsTrigger value="history">Teaching History</TabsTrigger>
                            </TabsList>

                            {/* Current Term Tab */}
                            <TabsContent value="current" className="space-y-4">
                              {/* Basic Info Card */}
                              {basicInfo && basicInfo.instructorInfo && (
                                <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                      <h3 className="text-xl font-semibold mb-1">{basicInfo.instructorInfo.name}</h3>
                                      <div className="text-sm text-muted-foreground">
                                        {basicInfo.instructorInfo.department} • {basicInfo.instructorInfo.college}
                                      </div>
                                      {basicInfo.instructorInfo.email && (
                                        <div className="text-sm mt-2">
                                          <a href={`mailto:${basicInfo.instructorInfo.email}`} className="text-primary hover:underline">
                                            {basicInfo.instructorInfo.email}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        Faculty
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {currentStatus && (
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                    <span className="text-xs text-muted-foreground">Current Term</span>
                                    <span className="font-semibold">
                                      {currentStatus.currentStatus.currentTerm} {currentStatus.currentStatus.currentYear}
                                    </span>
                                  </div>

                                  <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                    <span className="text-xs text-muted-foreground">Teaching Status</span>
                                    <span className="font-semibold">
                                      {currentStatus.currentStatus.isCurrentlyTeaching ? (
                                        <span className="text-green-600">Active</span>
                                      ) : (
                                        <span className="text-amber-600">Inactive</span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                    <span className="text-xs text-muted-foreground">Current Courses</span>
                                    <span className="font-semibold">
                                      {currentStatus.currentStatus.currentCourseCount}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Current Courses Section */}
                              {(() => {
                                const currentCourses = courseDetails?.courseDetails || [];
                                return currentCourses.length > 0 ? (
                                  <div className="space-y-4">
                                    <h4 className="font-medium">Current Courses ({currentCourses.length})</h4>
                                    <div className="space-y-3">
                                      {currentCourses.map((course, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                          <div>
                                            <div className="font-medium">
                                              {course.courseId}: {course.courseTitle}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              CRN {course.crn}
                                            </div>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-sm">
                                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                                              <span>{course.creditHours} Credit Hours</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm">
                                              <Users className="h-4 w-4 text-muted-foreground" />
                                              <span>{course.studentCount} Students</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-end">
                                            <Badge>
                                              {course.totalCreditHours || (course.creditHours * course.studentCount)} Credit Hours Total
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    {currentStatus && currentStatus.currentStatus.isCurrentlyTeaching ? (
                                      <>
                                        <div>No current courses to display</div>
                                        {courseDetails && (
                                          <div className="text-xs">
                                            Total Courses: {courseDetails.courseDetails?.length || 0}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      "Professor is not teaching any courses this term"
                                    )}
                                  </div>
                                )
                              })()}
                            </TabsContent>

                            {/* Teaching Summary Tab */}
                            <TabsContent value="summary" className="space-y-4">
                              {teachingSummary && teachingSummary.teachingSummary ? (
                                <>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                      <span className="text-xs text-muted-foreground">Total Courses</span>
                                      <span className="font-semibold">
                                        {teachingSummary.teachingSummary.totalCoursesTaught}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {teachingSummary.teachingSummary.uniqueCoursesTaught} unique
                                      </span>
                                    </div>

                                    <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                      <span className="text-xs text-muted-foreground">Total Students</span>
                                      <span className="font-semibold">
                                        {teachingSummary.teachingSummary.totalStudentsTaught}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Avg. {teachingSummary.teachingSummary.averageClassSize}/class
                                      </span>
                                    </div>

                                    <div className="flex flex-col bg-muted/10 rounded-md p-2 border text-center">
                                      <span className="text-xs text-muted-foreground">Credit Hours</span>
                                      <span className="font-semibold">
                                        {teachingSummary.teachingSummary.totalCreditHoursDelivered}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Total
                                      </span>
                                    </div>
                                  </div>

                                  <h4 className="font-medium mt-4">Most Taught Courses</h4>
                                  <div className="space-y-3">
                                    {teachingSummary.teachingSummary.mostTaughtCourses &&
                                      teachingSummary.teachingSummary.mostTaughtCourses.map((course, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                                          <div>
                                            <div className="font-medium">{course.courseId}: {course.courseTitle}</div>
                                          </div>
                                          <Badge variant="outline">{course.timesTaught} times</Badge>
                                        </div>
                                      ))}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  No teaching summary available
                                </div>
                              )}
                            </TabsContent>

                            {/* Teaching History Tab */}
                            <TabsContent value="history" className="space-y-4">
                              {termSummaries && termSummaries.termSummaries && termSummaries.termSummaries.length > 0 ? (
                                <div className="space-y-4">
                                  <h4 className="font-medium">Teaching History by Term</h4>
                                  <div className="space-y-3">
                                    {termSummaries.termSummaries.map((term, index) => (
                                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                                        <div>
                                          <div className="font-medium">{term.termName} {term.year}</div>
                                          <div className="text-sm text-muted-foreground">{term.termCode}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span>{term.courseCount} Courses</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          <span>{term.totalStudents} Students</span>
                                        </div>
                                        <div className="flex items-center justify-end">
                                          <Badge>{term.totalCreditHours} Credit Hours Total</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  No teaching history to display
                                </div>
                              )}

                              {/* Historical Courses Section in Teaching History Tab */}
                              {(() => {
                                // Use allCourses for historical data if available, otherwise fall back to courseDetails
                                const allCoursesList = allCourses?.courseDetails || [];
                                const currentCourseIds = (courseDetails?.courseDetails || [])
                                  .map(course => `${course.courseId}-${course.termCode}-${course.year}-${course.crn}`)
                                  .filter(Boolean);

                                // Filter out current courses from all courses to get historical ones
                                const historicalCourses = allCoursesList.filter(course => {
                                  const courseIdentifier = `${course.courseId}-${course.termCode}-${course.year}-${course.crn}`;
                                  return !currentCourseIds.includes(courseIdentifier);
                                });

                                return historicalCourses.length > 0 ? (
                                  <div className="space-y-4 mt-6">
                                    <h4 className="font-medium">Historical Courses ({historicalCourses.length})</h4>
                                    <div className="space-y-3">
                                      {historicalCourses.map((course, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                                          <div>
                                            <div className="font-medium">
                                              {course.courseId}: {course.courseTitle}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {course.termName} {course.year} • CRN {course.crn}
                                            </div>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-sm">
                                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                                              <span>{course.creditHours} Credit Hours</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm">
                                              <Users className="h-4 w-4 text-muted-foreground" />
                                              <span>{course.studentCount} Students</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-end">
                                            <Badge>
                                              {course.totalCreditHours || (course.creditHours * course.studentCount)} Credit Hours Total
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null
                              })()}
                            </TabsContent>
                          </Tabs>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedDepartment ? "No professors found in this department" : "Please select a department to view professors"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfessorTeachingInfo

