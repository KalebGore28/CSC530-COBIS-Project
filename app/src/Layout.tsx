import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Session } from "./App";

import {
	Armchair,
	BookOpen,
	Compass,
	LayoutList,
	Settings,
	Shield,
} from "lucide-react"

// Assuming this is the shape of a role from data.roles for consistency with AppSidebar
interface Role {
	id: number;
	name: string;
	logo: React.ElementType; // For role icons in AppSidebar
}

interface LayoutProps {
	session: Session | null;
	onLogout: () => void;
}

export default function Layout({ session, onLogout }: LayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();

	// Define route permissions: map routes to allowed role IDs
	const routePermissions: { [key: string]: number[] } = {
		"/dashboard": [1, 2, 3, 4, 5, 6], // All roles can access
		"/reports": [1, 2, 6],            // Faculty, Advisor, COBIS Admin
		"/reports/students": [1, 2, 6],
		"/cobis-tools": [6],              // COBIS Admin only
		"/cobis-tools/query-builder": [6],
		"/cobis-tools/imports": [6],
		"/test-page": [1, 2, 3, 4, 5, 6],
		// Add more routes as needed based on your app
	};

	// Get user's roles from session
	const userRoles = session?.roles || []; // { role_id: number; role_name: string }[]

	// Since AppSidebar may use a different role structure (with logos), assume we have a static roles list
	// For this example, we'll mock it; ideally, import from a shared data file
	const allRoles: Role[] = [
		{ id: 1, name: "Faculty", logo: BookOpen },
		{ id: 2, name: "Advisor", logo: Compass },
		{ id: 3, name: "Program Coordinator", logo: LayoutList },
		{ id: 4, name: "Department Chair", logo: Armchair },
		{ id: 5, name: "Administrator", logo: Settings },
		{ id: 6, name: "COBIS Admin", logo: Shield },
	];

	// Filter roles the user has
	const filteredRoles = allRoles.filter(role =>
		userRoles.some(userRole => userRole.role_id === role.id)
	);

	// Manage selected role state, persisting it in sessionStorage
	const [selectedRole, setSelectedRole] = useState<Role | null>(() => {
		const savedRoleId = sessionStorage.getItem("selectedRoleId");
		const roleIdNum = savedRoleId ? Number(savedRoleId) : null;
		const savedRole = roleIdNum
			? filteredRoles.find(role => role.id === roleIdNum)
			: null;
		return savedRole || filteredRoles[0] || null;
	});

	// Persist selected role to sessionStorage when it changes
	useEffect(() => {
		if (selectedRole) {
			sessionStorage.setItem("selectedRoleId", selectedRole.id.toString());
		} else {
			sessionStorage.removeItem("selectedRoleId");
		}
	}, [selectedRole]);

	// Route protection logic
	useEffect(() => {
		if (selectedRole) {
			const currentPath = location.pathname;
			const allowedRoles = routePermissions[currentPath];
			// If the route exists in permissions and the user's role isn't allowed, redirect
			if (allowedRoles && !allowedRoles.includes(selectedRole.id)) {
				navigate("/dashboard");
			}
		}
	}, [location.pathname, selectedRole, navigate]);

	return (
		<SidebarProvider>
			<AppSidebar
				session={session}
				onLogout={onLogout}
				selectedRole={selectedRole}
				onRoleChange={setSelectedRole}
				roles={filteredRoles}
				routePermissions={routePermissions}
			/>
			<SidebarInset className="flex flex-col h-screen">
				<SiteHeader />
				<div className="flex-1 overflow-y-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}