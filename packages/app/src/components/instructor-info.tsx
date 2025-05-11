"use client"

import { useEffect, useState } from "react"
import { BookOpen, Clock, History } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// TypeScript interfaces based on the database schema
interface Instructor {
  mnumber: string
  first_name: string
  middle_name: string
  last_name: string
  email: string
  department: string
  college: string
}

interface Course {
  subject: string
  number: number
  suffix: string
  title: string
  hours: number
  section: string
  term: string
  year: number
  role: string
}

interface InstructorPageProps {
  mNumber: string
}

export default function InstructorPage({ mNumber }: InstructorPageProps) {
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [currentCourses, setCurrentCourses] = useState<Course[]>([])
  const [previousCourses, setPreviousCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCreditHours, setTotalCreditHours] = useState(0)

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        // Placeholder instructor data
        setInstructor({
          mnumber: mNumber,
          first_name: "John",
          middle_name: "A",
          last_name: "Smith",
          email: "john.smith@university.edu",
          department: "Computer Science",
          college: "College of Science",
        })

        // Placeholder current courses
        setCurrentCourses([
          {
            subject: "CS",
            number: 101,
            suffix: "",
            title: "Introduction to Programming",
            hours: 3,
            section: "001",
            term: "Spring",
            year: 2025,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 240,
            suffix: "",
            title: "Data Structures",
            hours: 4,
            section: "002",
            term: "Spring",
            year: 2025,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 430,
            suffix: "",
            title: "Database Systems",
            hours: 3,
            section: "001",
            term: "Spring",
            year: 2025,
            role: "Instructor",
          },
        ])

        // Placeholder previous courses
        setPreviousCourses([
          {
            subject: "CS",
            number: 101,
            suffix: "",
            title: "Introduction to Programming",
            hours: 3,
            section: "001",
            term: "Fall",
            year: 2024,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 240,
            suffix: "",
            title: "Data Structures",
            hours: 4,
            section: "002",
            term: "Fall",
            year: 2024,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 350,
            suffix: "",
            title: "Software Engineering",
            hours: 3,
            section: "001",
            term: "Fall",
            year: 2024,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 101,
            suffix: "",
            title: "Introduction to Programming",
            hours: 3,
            section: "002",
            term: "Spring",
            year: 2024,
            role: "Instructor",
          },
          {
            subject: "CS",
            number: 430,
            suffix: "",
            title: "Database Systems",
            hours: 3,
            section: "001",
            term: "Spring",
            year: 2024,
            role: "Instructor",
          },
        ])

        // Calculate total credit hours
        const currentHours = currentCourses.reduce((total, course) => total + course.hours, 0)
        setTotalCreditHours(currentHours)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching instructor data:", error)
        setLoading(false)
      }
    }

    fetchInstructorData()
  }, [mNumber])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading instructor information...</p>
        </div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Instructor Not Found</h2>
          <p className="mt-2 text-muted-foreground">No instructor found with M-Number: {mNumber}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="grid gap-6">
        {/* Instructor Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {instructor.first_name} {instructor.middle_name ? `${instructor.middle_name.charAt(0)}. ` : ""}
                  {instructor.last_name}
                </h2>
                <p className="text-muted-foreground">
                  {instructor.department}, {instructor.college}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>M-Number:</span> {instructor.mnumber}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>Email:</span> {instructor.email}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Courses</p>
                    <p className="font-medium">{currentCourses.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Credit Hours</p>
                    <p className="font-medium">{totalCreditHours}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Courses</p>
                    <p className="font-medium">{previousCourses.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Information Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="current">Current Courses</TabsTrigger>
            <TabsTrigger value="previous">Previous Courses</TabsTrigger>
          </TabsList>

          {/* Current Courses Tab */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Current Courses</CardTitle>
                <CardDescription>Courses being taught in the current term (Spring 2025)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Credit Hours</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {course.subject} {course.number}
                            {course.suffix}
                          </TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.section}</TableCell>
                          <TableCell>{course.hours}</TableCell>
                          <TableCell>{course.role}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
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
                <CardTitle>Previous Courses</CardTitle>
                <CardDescription>Courses taught in previous terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Group previous courses by term and year */}
                  {Array.from(new Set(previousCourses.map((course) => `${course.term} ${course.year}`))).map(
                    (termYear) => (
                      <div key={termYear} className="space-y-3">
                        <h3 className="font-semibold text-lg">{termYear}</h3>
                        <Separator />
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Section</TableHead>
                              <TableHead>Credit Hours</TableHead>
                              <TableHead>Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previousCourses
                              .filter((course) => `${course.term} ${course.year}` === termYear)
                              .map((course, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {course.subject} {course.number}
                                    {course.suffix}
                                  </TableCell>
                                  <TableCell>{course.title}</TableCell>
                                  <TableCell>{course.section}</TableCell>
                                  <TableCell>{course.hours}</TableCell>
                                  <TableCell>{course.role}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ),
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

        {/* Teaching Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Teaching Summary</CardTitle>
            <CardDescription>Overview of teaching history and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Total Courses Taught</h3>
                <p className="text-3xl font-bold">{currentCourses.length + previousCourses.length}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Unique Courses</h3>
                <p className="text-3xl font-bold">
                  {
                    new Set(
                      [...currentCourses, ...previousCourses].map(
                        (course) => `${course.subject}${course.number}${course.suffix}`,
                      ),
                    ).size
                  }
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">Total Credit Hours</h3>
                <p className="text-3xl font-bold">
                  {[...currentCourses, ...previousCourses].reduce((total, course) => total + course.hours, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

