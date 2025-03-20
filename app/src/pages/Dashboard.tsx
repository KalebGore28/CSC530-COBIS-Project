import { Session } from "../App"

interface DashboardProps {
	session: Session | null;
}

export default function Dashboard({ session }: DashboardProps) {
	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					{session && (
						<div className="flex flex-col gap-2">
							<h1 className="text-2xl font-semibold">Welcome, {session.user.name}!</h1>
							<p className="text-gray-500">You are now logged in.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}