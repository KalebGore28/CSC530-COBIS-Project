"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import SearchInput from "@/components/search-input";

// TypeScript interfaces
interface Course {
  id: string
  code: string
  name: string
}
interface FilterState {
  academicLevels: string[]
  gpaRange: [number, number]
  majors: Program[]
  minors: Program[]
  coursesTaken: Course[]
  coursesNotTaken: Course[]
  gradeFilters: {
    course: Course | null
    grade: string | null
  }[]
}
interface Program {
  code: string;
  description: string;
  cipCode?: string;
  isMajor?: boolean;
  isMinor?: boolean;
  hasConcentration?: boolean;
  isDiscontinued?: boolean;
  isAacsb?: boolean;
  department?: string;
  college?: string;
}

const fetchMajors = async (query: string): Promise<Program[]> => {
  try {
    const response = await fetch(`/api/search/programs?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }
    const data: Program[] = await response.json();
    const filteredData = data.filter((program) => !program.isDiscontinued && program.isMajor);
    return filteredData;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

const fetchMinors = async (query: string): Promise<Program[]> => {
  try {
    const response = await fetch(`/api/search/programs?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }
    const data: Program[] = await response.json();
    const filteredData = data.filter((program) => !program.isDiscontinued && program.isMinor);
    return filteredData;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

const StudentFilters = () => {
  const academicLevelOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
  const courseOptions: Course[] = [
    { id: "cs101", code: "CS 101", name: "Introduction to Computer Science" },
    { id: "cs201", code: "CS 201", name: "Data Structures and Algorithms" },
    { id: "cs301", code: "CS 301", name: "Database Systems" },
    { id: "cs401", code: "CS 401", name: "Software Engineering" },
    { id: "math101", code: "MATH 101", name: "Calculus I" },
    { id: "math201", code: "MATH 201", name: "Linear Algebra" },
    { id: "eng101", code: "ENG 101", name: "English Composition" },
    { id: "phy101", code: "PHY 101", name: "Physics I" },
  ]
  const gradeOptions = ["A", "B", "C", "D", "F"]

  const [filters, setFilters] = useState<FilterState>({
    academicLevels: [],
    gpaRange: [0, 4.0],
    majors: [],
    minors: [],
    coursesTaken: [],
    coursesNotTaken: [],
    gradeFilters: [{ course: null, grade: null }],
  })

  const [newCourseTaken, setNewCourseTaken] = useState<string>("")
  const [newCourseNotTaken, setNewCourseNotTaken] = useState<string>("")

  const handleAcademicLevelChange = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      academicLevels: prev.academicLevels.includes(level)
        ? prev.academicLevels.filter((l) => l !== level)
        : [...prev.academicLevels, level],
    }))
  }

  const handleAddMajor = (major: Program) => {
    setFilters((prev) => ({
      ...prev,
      majors: prev.majors.some((m) => m.code === major.code) ? prev.majors : [...prev.majors, major],
    }))
  }

  const handleRemoveMajor = (major: Program) => {
    setFilters((prev) => ({
      ...prev,
      majors: prev.majors.filter((m) => m.code !== major.code),
    }))
  }

  const handleAddMinor = (minor: Program) => {
    setFilters((prev) => ({
      ...prev,
      minors: prev.minors.some((m) => m.code === minor.code) ? prev.minors : [...prev.minors, minor],
    }))
  }

  const handleRemoveMinor = (minor: Program) => {
    setFilters((prev) => ({
      ...prev,
      minors: prev.minors.filter((m) => m.code !== minor.code),
    }))
  }

  const handleGpaRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      gpaRange: [values[0], values[1]] as [number, number],
    }))
  }

  const addCourseTaken = (courseId: string) => {
    const course = courseOptions.find((c) => c.id === courseId)
    if (course && !filters.coursesTaken.some((c) => c.id === courseId)) {
      setFilters((prev) => ({
        ...prev,
        coursesTaken: [...prev.coursesTaken, course],
      }))
      setNewCourseTaken("")
    }
  }

  const removeCourseTaken = (courseId: string) => {
    setFilters((prev) => ({
      ...prev,
      coursesTaken: prev.coursesTaken.filter((c) => c.id !== courseId),
    }))
  }

  const addCourseNotTaken = (courseId: string) => {
    const course = courseOptions.find((c) => c.id === courseId)
    if (course && !filters.coursesNotTaken.some((c) => c.id === courseId)) {
      setFilters((prev) => ({
        ...prev,
        coursesNotTaken: [...prev.coursesNotTaken, course],
      }))
      setNewCourseNotTaken("")
    }
  }

  const removeCourseNotTaken = (courseId: string) => {
    setFilters((prev) => ({
      ...prev,
      coursesNotTaken: prev.coursesNotTaken.filter((c) => c.id !== courseId),
    }))
  }

  const updateGradeFilter = (index: number, field: "course" | "grade", value: string) => {
    setFilters((prev) => {
      const newGradeFilters = [...prev.gradeFilters]
      if (field === "course") {
        const course = courseOptions.find((c) => c.id === value) || null
        newGradeFilters[index] = { ...newGradeFilters[index], course }
      } else {
        newGradeFilters[index] = { ...newGradeFilters[index], grade: value }
      }
      return { ...prev, gradeFilters: newGradeFilters }
    })
  }

  const addGradeFilter = () => {
    setFilters((prev) => ({
      ...prev,
      gradeFilters: [...prev.gradeFilters, { course: null, grade: null }],
    }))
  }

  const removeGradeFilter = (index: number) => {
    setFilters((prev) => ({
      ...prev,
      gradeFilters: prev.gradeFilters.filter((_, i) => i !== index),
    }))
  }

  const resetFilters = () => {
    setFilters({
      academicLevels: [],
      gpaRange: [0, 4.0],
      majors: [],
      minors: [],
      coursesTaken: [],
      coursesNotTaken: [],
      gradeFilters: [{ course: null, grade: null }],
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Academic Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Academic Level */}
                <div className="space-y-2">
                  <Label className="text-base">Academic Level</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {academicLevelOptions.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level}`}
                          checked={filters.academicLevels.includes(level)}
                          onCheckedChange={() => handleAcademicLevelChange(level)}
                        />
                        <Label htmlFor={`level-${level}`} className="font-normal">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {/* GPA Range */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-base">GPA Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.gpaRange[0].toFixed(1)} - {filters.gpaRange[1].toFixed(1)}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 4.0]}
                      value={[filters.gpaRange[0], filters.gpaRange[1]]}
                      max={4.0}
                      step={0.1}
                      minStepsBetweenThumbs={1}
                      onValueChange={handleGpaRangeChange}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* Majors */}
                <div className="space-y-2">
                  <Label className="text-base">Major</Label>
                  <SearchInput<Program>
                    searchApi={fetchMajors}
                    onSelect={handleAddMajor}
                    onRemove={handleRemoveMajor}
                    selectedItems={filters.majors}
                    placeholder="Type to search majors..."
                    renderResult={(program: Program) => `${program.code} - ${program.description}`}
                    className="h-40"
                  />
                </div>
                {/* Minors */}
                <div className="space-y-2">
                  <Label className="text-base">Minor</Label>
                  <SearchInput<Program>
                    searchApi={fetchMinors}
                    onSelect={handleAddMinor}
                    onRemove={handleRemoveMinor}
                    selectedItems={filters.minors}
                    placeholder="Type to search minors..."
                    renderResult={(program: Program) => `${program.code} - ${program.description}`}
                    className="h-40"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Course History</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Courses Taken */}
                <div className="space-y-4">
                  <Label className="text-base">Courses Taken</Label>
                  <div className="flex space-x-2">
                    <Select value={newCourseTaken} onValueChange={setNewCourseTaken}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addCourseTaken(newCourseTaken)}
                      disabled={!newCourseTaken}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.coursesTaken.map((course) => (
                      <Badge key={course.id} variant="default" className="flex items-center gap-1">
                        {course.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeCourseTaken(course.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-base">Courses Not Taken</Label>
                  <div className="flex space-x-2">
                    <Select value={newCourseNotTaken} onValueChange={setNewCourseNotTaken}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addCourseNotTaken(newCourseNotTaken)}
                      disabled={!newCourseNotTaken}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.coursesNotTaken.map((course) => (
                      <Badge key={course.id} variant="secondary" className="flex items-center gap-1">
                        {course.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeCourseNotTaken(course.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {/* Grade Filters */}
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Grade Filters</Label>
                  <Button variant="outline" size="sm" onClick={addGradeFilter} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Filter
                  </Button>
                </div>
                <div className="space-y-3">
                  {filters.gradeFilters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={filter.course?.id || ""}
                        onValueChange={(value) => updateGradeFilter(index, "course", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseOptions.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filter.grade || ""}
                        onValueChange={(value) => updateGradeFilter(index, "grade", value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filters.gradeFilters.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGradeFilter(index)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
          <Button onClick={() => alert("Filters applied!")}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentFilters