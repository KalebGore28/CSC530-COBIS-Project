"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Users, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// TypeScript interfaces
interface Course {
	id: string
	code: string
	name: string
	creditHours: number
	students: number
}

interface Professor {
	id: string
	name: string
	title: string
	courses: Course[]
}

interface Department {
	id: string
	name: string
	professors: Professor[]
}

const ProfessorTeachingInfo = () => {
	// Sample data for departments and professors
	const departments: Department[] = [
		{
			id: "cs",
			name: "Computer Science",
			professors: [
				{
					id: "prof1",
					name: "Dr. Jane Smith",
					title: "Associate Professor",
					courses: [
						{ id: "cs101", code: "CS 101", name: "Introduction to Computer Science", creditHours: 3, students: 45 },
						{ id: "cs301", code: "CS 301", name: "Database Systems", creditHours: 3, students: 32 },
						{ id: "cs401", code: "CS 401", name: "Software Engineering", creditHours: 4, students: 28 },
					],
				},
				{
					id: "prof2",
					name: "Dr. John Davis",
					title: "Professor",
					courses: [
						{ id: "cs201", code: "CS 201", name: "Data Structures and Algorithms", creditHours: 4, students: 38 },
						{ id: "cs450", code: "CS 450", name: "Machine Learning", creditHours: 3, students: 25 },
					],
				},
				{
					id: "prof3",
					name: "Dr. Michael Chen",
					title: "Assistant Professor",
					courses: [
						{ id: "cs350", code: "CS 350", name: "Computer Networks", creditHours: 3, students: 30 },
						{ id: "cs375", code: "CS 375", name: "Web Development", creditHours: 3, students: 42 },
						{ id: "cs475", code: "CS 475", name: "Mobile App Development", creditHours: 3, students: 35 },
					],
				},
			],
		},
		{
			id: "math",
			name: "Mathematics",
			professors: [
				{
					id: "prof4",
					name: "Dr. Sarah Johnson",
					title: "Professor",
					courses: [
						{ id: "math101", code: "MATH 101", name: "Calculus I", creditHours: 4, students: 50 },
						{ id: "math201", code: "MATH 201", name: "Linear Algebra", creditHours: 3, students: 35 },
					],
				},
				{
					id: "prof5",
					name: "Dr. Robert Wilson",
					title: "Associate Professor",
					courses: [
						{ id: "math301", code: "MATH 301", name: "Differential Equations", creditHours: 3, students: 28 },
						{ id: "math401", code: "MATH 401", name: "Abstract Algebra", creditHours: 3, students: 20 },
					],
				},
			],
		},
		{
			id: "phys",
			name: "Physics",
			professors: [
				{
					id: "prof6",
					name: "Dr. Emily Brown",
					title: "Professor",
					courses: [
						{ id: "phys101", code: "PHYS 101", name: "Physics I", creditHours: 4, students: 45 },
						{ id: "phys201", code: "PHYS 201", name: "Physics II", creditHours: 4, students: 38 },
					],
				},
				{
					id: "prof7",
					name: "Dr. David Lee",
					title: "Assistant Professor",
					courses: [
						{ id: "phys301", code: "PHYS 301", name: "Quantum Mechanics", creditHours: 3, students: 25 },
						{ id: "phys401", code: "PHYS 401", name: "Thermodynamics", creditHours: 3, students: 22 },
					],
				},
			],
		},
	]

	const [selectedDepartment, setSelectedDepartment] = useState<string>("")
	const [expandedProfessor, setExpandedProfessor] = useState<string | null>(null)

	// Get the selected department data
	const selectedDeptData = departments.find((dept) => dept.id === selectedDepartment)

	// Toggle professor expansion
	const toggleProfessor = (professorId: string) => {
		if (expandedProfessor === professorId) {
			setExpandedProfessor(null)
		} else {
			setExpandedProfessor(professorId)
		}
	}

	// Calculate total credit hours for a professor (students × credit hours)
	const calculateTotalCreditHours = (courses: Course[]) => {
		return courses.reduce((total, course) => total + course.students * course.creditHours, 0)
	}

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
									<SelectItem key={dept.id} value={dept.id}>
										{dept.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Professor List */}
					{selectedDeptData && (
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Professors</h3>
							<div className="border rounded-md divide-y">
								{selectedDeptData.professors.map((professor) => (
									<div key={professor.id} className="divide-y">
										<div
											className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
											onClick={() => toggleProfessor(professor.id)}
										>
											<div className="space-y-1">
												<div className="font-medium">{professor.name}</div>
												<div className="text-sm text-muted-foreground">{professor.title}</div>
											</div>
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-1.5 text-sm">
													<BookOpen className="h-4 w-4 text-muted-foreground" />
													<span>{professor.courses.length} Classes</span>
												</div>
												<div className="flex items-center gap-1.5 text-sm">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span>{professor.courses.reduce((sum, course) => sum + course.students, 0)} Students</span>
												</div>
												<Badge variant="outline" className="ml-2">
													{calculateTotalCreditHours(professor.courses)} Credit Hours Total
												</Badge>
												<Button variant="ghost" size="icon">
													{expandedProfessor === professor.id ? (
														<ChevronDown className="h-4 w-4" />
													) : (
														<ChevronRight className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>

										{/* Expanded Course Information */}
										{expandedProfessor === professor.id && (
											<div className="p-4 bg-muted/20">
												<h4 className="font-medium mb-2">Courses Teaching</h4>
												<div className="space-y-3">
													{professor.courses.map((course) => (
														<div key={course.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
															<div>
																<div className="font-medium">
																	{course.code}: {course.name}
																</div>
															</div>
															<div className="flex items-center gap-1.5 text-sm">
																<BookOpen className="h-4 w-4 text-muted-foreground" />
																<span>{course.creditHours} Credit Hours</span>
															</div>
															<div className="flex items-center gap-1.5 text-sm">
																<Users className="h-4 w-4 text-muted-foreground" />
																<span>{course.students} Students</span>
															</div>
															<Badge>{course.students * course.creditHours} Credit Hours Total</Badge>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{!selectedDepartment && (
						<div className="text-center py-8 text-muted-foreground">Please select a department to view professors</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default ProfessorTeachingInfo