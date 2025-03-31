import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useSession } from "@/hooks/session-context"

export default function Dashboard() {
	const { session } = useSession();
	return (
		<div className="p-6">
			<header className="mb-12">
				<h2 className="text-3xl font-bold text-center text-foreground">
					Welcome Back, {session?.user.name}
				</h2>
				<p className="text-muted-foreground text-center">
					Query student information and generate reports.
				</p>
			</header>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-center">Student Lookup</CardTitle>
						<CardDescription className="text-center">
							Search for students by name, ID, department, major, minor, GPA, or previous classes.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Link to="/student-lookup">
							<Button variant="default">Search Students</Button>
						</Link>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-center">Placeholder</CardTitle>
						<CardDescription className="text-center">
							Placeholder description for a future tool.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button variant="default" disabled>
							Coming Soon
						</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-center">Placeholder</CardTitle>
						<CardDescription className="text-center">
							Placeholder description for a future tool.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button variant="default" disabled>
							Coming Soon
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}