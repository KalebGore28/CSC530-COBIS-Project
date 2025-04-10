import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableFooter,
	TableRow
} from "@/components/ui/table";
import { Mail, Phone, MapPin, Building, BookOpen } from 'lucide-react';

// Types based on your API responses
type Instructor = {
	mnumber: string;
	name: string;
	firstName: string;
	lastName: string;
	department: string;
	departmentCode: string;
	college: string;
	collegeCode: string;
	email: string;
	image: string;
};

type TermSummary = {
	termCode: string;
	termName: string;
	year: number;
	courseCount: number;
	studentCount: number;
	creditHoursDelivered: number;
};

// Mock data based on your API examples
const instructorData: Instructor = {
	mnumber: "M123456",
	name: "John Doe",
	firstName: "John",
	lastName: "Doe",
	department: "Computer Science",
	departmentCode: "CS",
	college: "College of Engineering",
	collegeCode: "ENG",
	email: "johndoe@example.com",
	image: "https://example.com/images/johndoe.jpg"
};

const currentStatusData = {
	currentTerm: "FALL",
	currentTermCode: "80",
	currentYear: 2025,
	isCurrentlyTeaching: true,
	currentCourseCount: 2
};

const termSummariesData: TermSummary[] = [
	{
		termCode: "80",
		termName: "FALL",
		year: 2023,
		courseCount: 3,
		studentCount: 90,
		creditHoursDelivered: 90
	},
	{
		termCode: "40",
		termName: "SPRING",
		year: 2023,
		courseCount: 2,
		studentCount: 75,
		creditHoursDelivered: 75
	},
	{
		termCode: "60",
		termName: "SUMMER",
		year: 2022,
		courseCount: 1,
		studentCount: 30,
		creditHoursDelivered: 30
	},
	{
		termCode: "80",
		termName: "FALL",
		year: 2022,
		courseCount: 3,
		studentCount: 95,
		creditHoursDelivered: 95
	}
];

// Helper function to get initials from name
const getInitials = (name: string): string => {
	return name
		.split(' ')
		.map(part => part.charAt(0))
		.join('')
		.toUpperCase();
};

const FacultyProfilePage: React.FC = () => {
	return (
		<div className="container mx-auto p-6 max-w-5xl">
			<div className="grid gap-6">
				{/* Header section with profile info */}
				<div className="flex flex-col md:flex-row gap-6 items-start">
					<div className="flex-shrink-0">
						<Avatar className="h-24 w-24 border-2 border-primary">
							<AvatarImage src={instructorData.image} alt={instructorData.name} />
							<AvatarFallback className="text-2xl">
								{getInitials(instructorData.name)}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className="flex-grow space-y-2">
						<div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
							<div>
								<h1 className="text-3xl font-bold">{instructorData.name}</h1>
								<p className="text-xl text-muted-foreground">{instructorData.department}</p>
								<p className="text-sm text-muted-foreground">{instructorData.college}</p>
							</div>

							<div className="flex flex-col gap-2">
								{currentStatusData.isCurrentlyTeaching ? (
									<Badge className="self-start" variant="outline">Currently Teaching</Badge>
								) : (
									<Badge className="self-start" variant="outline">Not Currently Teaching</Badge>
								)}
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<a href={`mailto:${instructorData.email}`} className="text-sm hover:underline">
										{instructorData.email}
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Additional Information Tabs */}
				<Tabs defaultValue="current" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="current">Current Term</TabsTrigger>
						<TabsTrigger value="history">Teaching History</TabsTrigger>
					</TabsList>

					{/* Current Term Tab */}
					<TabsContent value="current">
						<Card>
							<CardHeader>
								<CardTitle>Current Term: {currentStatusData.currentTerm} {currentStatusData.currentYear}</CardTitle>
								<CardDescription>
									Currently teaching {currentStatusData.currentCourseCount} courses
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Placeholder for course schedule - would be populated from API */}
									<p className="text-muted-foreground italic">Course schedule information would be displayed here.</p>

									{/* Example schedule display */}
									<Card>
										<CardHeader className="pb-2">
											<CardTitle className="text-lg">Current Schedule</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="rounded-md border">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Course</TableHead>
															<TableHead>Title</TableHead>
															<TableHead>Days</TableHead>
															<TableHead>Time</TableHead>
															<TableHead>Room</TableHead>
															<TableHead>Students</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{/* Example course data - would be populated from API */}
														<TableRow>
															<TableCell className="font-medium">CS 101</TableCell>
															<TableCell>Intro to Programming</TableCell>
															<TableCell>Mon/Wed</TableCell>
															<TableCell>9:00 - 10:15</TableCell>
															<TableCell>SCI 305</TableCell>
															<TableCell>35</TableCell>
														</TableRow>
														<TableRow>
															<TableCell className="font-medium">CS 350</TableCell>
															<TableCell>Database Systems</TableCell>
															<TableCell>Tue/Thu</TableCell>
															<TableCell>11:00 - 12:15</TableCell>
															<TableCell>ENG 220</TableCell>
															<TableCell>28</TableCell>
														</TableRow>
													</TableBody>
												</Table>
											</div>
										</CardContent>
									</Card>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Teaching History Tab */}
					<TabsContent value="history">
						<Card>
							<CardHeader>
								<CardTitle>Teaching History</CardTitle>
								<CardDescription>
									Summary of courses taught across terms
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Term</TableHead>
												<TableHead>Year</TableHead>
												<TableHead>Courses</TableHead>
												<TableHead>Students</TableHead>
												<TableHead>Credit Hours</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{termSummariesData.map((term, index) => (
												<TableRow key={index}>
													<TableCell className="font-medium">{term.termName}</TableCell>
													<TableCell>{term.year}</TableCell>
													<TableCell>{term.courseCount}</TableCell>
													<TableCell>{term.studentCount}</TableCell>
													<TableCell>{term.creditHoursDelivered}</TableCell>
													<TableCell className="text-right">
														<a href="#" className="text-sm text-blue-600 hover:underline">
															View Details
														</a>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TableCell colSpan={2}>Totals</TableCell>
												<TableCell>
													{termSummariesData.reduce((sum, term) => sum + term.courseCount, 0)}
												</TableCell>
												<TableCell>
													{termSummariesData.reduce((sum, term) => sum + term.studentCount, 0)}
												</TableCell>
												<TableCell>
													{termSummariesData.reduce((sum, term) => sum + term.creditHoursDelivered, 0)}
												</TableCell>
												<TableCell></TableCell>
											</TableRow>
										</TableFooter>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default FacultyProfilePage;