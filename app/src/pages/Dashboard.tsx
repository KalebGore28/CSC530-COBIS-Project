import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard({ user }: { user: any }) {
	return (
		<div>
			<header className="mb-12">
				<h2 className="text-3xl font-bold text-center text-foreground">
					Welcome Back, {user.info.first_name}
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
						<Button variant="default">Search Students</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-center">Class Lookup</CardTitle>
						<CardDescription className="text-center">
							Query and view specific students from a particular class.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button variant="default">Search Classes</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-center">Generate Reports</CardTitle>
						<CardDescription className="text-center">
							Create custom reports for student or department data.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button variant="default">Generate</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}