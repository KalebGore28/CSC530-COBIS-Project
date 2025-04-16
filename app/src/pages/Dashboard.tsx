import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useSession } from "@/context/session"
import { useRoleContext } from "@/context/role"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Users, Database, LineChart, BarChart3, FileText } from "lucide-react"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { GradeDistributions, GradeDistributionData } from '@/components/charts/grade-distributions';

type CurrentTermResponse = {
	term: string;
	year: number;
	termName: string;
};

// Roles that can see the Grade Distribution component
const gradeDistributionRoles = ["Faculty", "Department Chair"];

// Define dashboard cards (Grade Distribution removed from here)
const dashboardCards = [
	{
		title: "Student Lookup",
		description: "Search for students by name, ID, department, major, minor, GPA, or previous classes.",
		icon: <Users className="h-8 w-8 mb-4 text-primary" />,
		link: "/student-lookup",
		buttonText: "Search Students",
		roles: ["Faculty", "Advisor", "Program Coordinator", "Department Chair", "Administrator", "COBIS Admin"]
	},
	{
		title: "Faculty Information",
		description: "View teaching loads, course enrollment, and student counts for faculty in your department.",
		icon: <BookOpen className="h-8 w-8 mb-4 text-primary" />,
		link: "/professor-stats",
		buttonText: "View Faculty",
		roles: ["Department Chair", "COBIS Admin"]
	},
	{
		title: "Student Reports",
		description: "Generate and view reports on student performance, enrollment, and academic progress.",
		icon: <FileText className="h-8 w-8 mb-4 text-primary" />,
		link: "/reports/students",
		buttonText: "View Reports",
		roles: ["Faculty", "Advisor", "COBIS Admin"]
	},
	{
		title: "Query Builder",
		description: "Create custom database queries for advanced data analysis and reporting.",
		icon: <Database className="h-8 w-8 mb-4 text-primary" />,
		link: "/cobis-tools/query-builder",
		buttonText: "Open Query Builder",
		roles: ["COBIS Admin"]
	},
	{
		title: "Data Import Tools",
		description: "Import and manage data from external sources for system integration.",
		icon: <BarChart3 className="h-8 w-8 mb-4 text-primary" />, // Note: Using BarChart3 for consistency, change if needed
		link: "/cobis-tools/imports",
		buttonText: "Access Import Tools",
		roles: ["COBIS Admin"]
	},
	{
		title: "Academic Analytics",
		description: "Analyze student performance metrics and educational outcomes.",
		icon: <LineChart className="h-8 w-8 mb-4 text-primary" />,
		link: "/reports",
		buttonText: "View Analytics",
		roles: ["Faculty", "Advisor", "COBIS Admin"]
	}
]

export default function Dashboard() {
	const { session } = useSession();
	const { selectedRole } = useRoleContext();

	const [currentTerm, setCurrentTerm] = useState<CurrentTermResponse | null>(null);
	const [gradeDistributions, setGradeDistributions] = useState<GradeDistributionData[]>([]);


	const fetchCurrentTerm = async () => {
		try {
			const response = await axios.get<CurrentTermResponse>('/api/utility/current-term', {
				withCredentials: true
			});
			setCurrentTerm(response.data);
			return response.data;
		} catch (error) {
			toast.error("Failed to load current term information")
			return null;
		}
	};

	const fetchGradeDistributions = async (offset: number) => {
		try {
			const response = await axios.get<{
				mnumber: string;
				start_year: number;
				end_year: number;
				gradeTrends: Array<{
					term: string;
					year: number;
					totalStudents: number;
					distribution: {
						[grade: string]: {
							count: number;
							percentage: number;
						}
					}
				}>
			}>(`/api/instructor/${session?.info.mnumber}/trend/grades`, {
				params: {
					start_year: currentTerm ? currentTerm.year + offset : undefined,
					end_year: currentTerm ? currentTerm.year : undefined
				},
				withCredentials: true
			});

			// Transform the data to match GradeDistributionData type
			const transformedData = response.data.gradeTrends.map(trend => {
				// If distribution is empty, create a distribution with all zeros
				const distribution = Object.keys(trend.distribution).length === 0 ? {
					"A": { count: 0, percentage: 0 },
					"B": { count: 0, percentage: 0 },
					"C": { count: 0, percentage: 0 },
					"D": { count: 0, percentage: 0 },
					"F": { count: 0, percentage: 0 },
					"N/A": { count: 0, percentage: 0 }
				} : trend.distribution;

				return {
					term: trend.term,
					year: trend.year,
					totalStudents: trend.totalStudents,
					distribution
				};
			});


			setGradeDistributions(transformedData);
		} catch (error) {
			toast.error("Failed to load grade distributions")
			setGradeDistributions([]);
		}
	};

	// Initial fetch for current term and grade distributions
	useEffect(() => {
		const fetchData = async () => await fetchCurrentTerm()
		fetchData();
	}, []);

	// Fetch grade distributions when current term is available
	useEffect(() => {
		if (currentTerm) {
			fetchGradeDistributions(-1); // Fetch for the current term
		}
	}, [currentTerm]);

	// Filter standard cards based on user's selected role
	const filteredCards = dashboardCards.filter(card =>
		selectedRole && card.roles.includes(selectedRole.name)
	);

	// Check if the current role should see the Grade Distribution card
	const canViewGradeDistribution = selectedRole && gradeDistributionRoles.includes(selectedRole.name);

	return (
		<div className="p-6">
			<Toaster />
			<div className="flex flex-col items-center space-y-2 mb-8">
				<h2 className="text-3xl font-bold tracking-tight">
					Welcome Back, {session?.session.data?.user.name}
				</h2>
				<p className="text-muted-foreground text-lg max-w-2xl text-center">
					Access your tools and information from this dashboard
				</p>
			</div>

			{/* Conditionally Render Grade Distribution Card - Full Width */}
			{canViewGradeDistribution && (
				<>
					<GradeDistributions
						data={gradeDistributions}
						onTimeRangeChange={(offset: number) => {
							fetchGradeDistributions(offset);
						}}
					/>
					<Separator className="my-6" /> {/* Separator after the grade card */}
				</>
			)}

			{/* Grid for the rest of the dashboard cards */}
			{filteredCards.length > 0 && ( // Only show grid if there are other cards
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredCards.map((card, index) => (
						<Card key={index} className="transition-all hover:shadow-md">
							<CardHeader className="text-center pt-6">
								<div className="flex justify-center">{card.icon}</div>
								<CardTitle>{card.title}</CardTitle>
								<CardDescription>
									{card.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex justify-center pb-6">
								<Link to={card.link}>
									<Button variant="default">
										{card.buttonText}
									</Button>
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Message if NO cards are available at all (neither grade dist nor standard) */}
			{!canViewGradeDistribution && filteredCards.length === 0 && (
				<div className="text-center p-12 text-muted-foreground mt-8"> {/* Added margin-top */}
					<p className="text-lg">No tools are currently available for your selected role.</p>
					<p>Please contact the administrator if you believe this is an error.</p>
				</div>
			)}
		</div>
	)
}