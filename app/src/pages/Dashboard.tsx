import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useSession } from "@/hooks/session-context"
import { useRoleContext } from "@/hooks/role-context"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Users, Database, LineChart, BarChart3, FileText } from "lucide-react"

// Define dashboard cards with role permissions
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
		icon: <BarChart3 className="h-8 w-8 mb-4 text-primary" />,
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

	// Filter cards based on user's selected role
	const filteredCards = dashboardCards.filter(card =>
		selectedRole && card.roles.includes(selectedRole.name)
	);

	return (
		<div className="p-6">
			<div className="flex flex-col items-center space-y-2 mb-8">
				<h2 className="text-3xl font-bold tracking-tight">
					Welcome Back, {session?.user.name}
				</h2>
				<p className="text-muted-foreground text-lg max-w-2xl text-center">
					Access your tools and information from this dashboard
				</p>
			</div>

			<Separator className="my-6" />

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

			{filteredCards.length === 0 && (
				<div className="text-center p-12 text-muted-foreground">
					<p className="text-lg">No tools are currently available for your selected role.</p>
					<p>Please contact the administrator if you believe this is an error.</p>
				</div>
			)}
		</div>
	)
}