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

export const CobisToolsPage: React.FC = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	// Derive the active tab from the URL (last segment), or default to "cobis-tools"
	const activeTab = pathname.split("/").pop() || "cobis-tools";

	return (
		<div className="p-4 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Cobis Tools</CardTitle>
					<CardDescription>
						Access various tools and utilities for Cobis.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={activeTab}
						onValueChange={(value) => navigate(value)}
						className="w-full"
					>
						<TabsList className="grid grid-cols-2">
							<TabsTrigger value="imports">Imports</TabsTrigger>
							<TabsTrigger value="users">Users</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardContent>
			</Card>

			{/* Nested routes render here */}
			<Outlet />
		</div>
	);
}