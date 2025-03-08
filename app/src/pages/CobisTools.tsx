import { Outlet, Link, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CobisTools({ user }: { user: any }) {
	const location = useLocation()

	return (
		<div>
			<header className="mb-12">
				<h2 className="text-3xl font-bold text-center text-foreground">
					COBIS Tools
				</h2>
				<p className="text-muted-foreground text-center mt-2">
					Welcome, {user.info.first_name}! Explore COBIS administrative tools.
				</p>
			</header>

			{/* Show overview if on /cobis-tools, otherwise render nested route */}
			{location.pathname === "/cobis-tools" ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">Query Builder</CardTitle>
							<CardDescription className="text-center">
								Create custom database queries with an intuitive interface.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center">
							<Link to="/cobis-tools/query-builder">
								<Button variant="default">Go to Query Builder</Button>
							</Link>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="text-center">Imports</CardTitle>
							<CardDescription className="text-center">
								Upload csv files to import data into the COBIS database.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center">
							<Link to="/cobis-tools/imports">
								<Button variant="default">Go to Imports</Button>
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
				</div>
			) : (
				<Outlet /> // Render nested routes like /cobis-tools/query-builder
			)}
		</div>
	)
}