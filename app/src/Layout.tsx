// Layout.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate, Location, NavigateFunction } from 'react-router-dom';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useRoleContext } from '@/hooks/role-context';

// Define an interface for the LayoutContent props
interface LayoutContentProps {
	selectedRole: any; // Replace with proper type from your role context
	routePermissions: Record<string, string[]>; // Replace with proper type from your role context
	location: Location;
	navigate: NavigateFunction;
}

export default function Layout() {
	const { selectedRole, routePermissions } = useRoleContext();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<SidebarProvider>
			<LayoutContent
				selectedRole={selectedRole}
				routePermissions={routePermissions}
				location={location}
				navigate={navigate}
			/>
		</SidebarProvider>
	);
}

// Separate component to access the sidebar context
function LayoutContent({ selectedRole, routePermissions, location, navigate }: LayoutContentProps) {

	// Route protection logic
	useEffect(() => {
		if (selectedRole) {
			const currentPath = location.pathname;
			const allowedRoles = routePermissions[currentPath];
			if (allowedRoles && !allowedRoles.includes(selectedRole.name)) {
				navigate("/dashboard");
			}
		}
	}, [location.pathname, selectedRole, navigate, routePermissions]);

	return (
		<>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<Outlet />
			</SidebarInset>
		</>
	);
}