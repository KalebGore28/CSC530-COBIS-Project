import React from "react"

export default function StudentsReport({ user }: { user: any }) {
	return (
		<div className="p-6">
			<h2 className="text-3xl font-bold text-center text-foreground">
				Student Reports
			</h2>
			<p className="text-muted-foreground text-center mt-2">
				Viewing student data for {user.info.first_name}.
			</p>
			<div className="mt-6">
				<ul className="list-disc pl-6 text-foreground">
					<li>Student 1 - GPA: 3.8</li>
					<li>Student 2 - GPA: 3.5</li>
					<li>Student 3 - GPA: 4.0</li>
				</ul>
			</div>
		</div>
	)
}