import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";

export const EnrollmentPage: React.FC = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	// Derive the active tab from the URL (last segment), or default to "programs"
	const activeTab = pathname.split("/").pop() || "programs";

	return (
		<div className="p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Enrollment Management</CardTitle>
					<CardDescription>
						View programs, courses, and faculty enrollments.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={(value) => navigate(value)}
						className="w-full"
					>
						<TabsList className="grid grid-cols-3">
							<TabsTrigger value="programs">Programs</TabsTrigger>
							<TabsTrigger value="courses">Courses</TabsTrigger>
							<TabsTrigger value="faculty">Faculty</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardContent>
			</Card>

			{/* Nested routes render here */}
			<Outlet />
		</div>
	);
};
