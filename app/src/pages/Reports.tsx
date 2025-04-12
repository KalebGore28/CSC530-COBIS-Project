import { Outlet, useLocation } from "react-router-dom"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useSession } from "@/context/session"

export default function Reports() {
	const { session } = useSession()
	const location = useLocation()

	// Check if we're on the base /reports route or a nested route
	const isBaseRoute = location.pathname === "/reports"

	return (
		<div className="p-6">
			{/* Show overview if on /reports, otherwise show nested route */}
			{isBaseRoute ? (
				<>
					<header className="mb-12">
						<h2 className="text-3xl font-bold text-center text-foreground">
							Reports Dashboard
						</h2>
						<p className="text-muted-foreground text-center mt-2">
							Generate and view reports, {session?.user.name}.
						</p>
					</header>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-center">Student Reports</CardTitle>
								<CardDescription className="text-center">
									View detailed student data across departments.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex justify-center">
								<Link to="/reports/students">
									<Button variant="default">View Students</Button>
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
				</>
			) : (
				<Outlet /> // Render nested routes like /reports/students
			)}
		</div>
	)
}