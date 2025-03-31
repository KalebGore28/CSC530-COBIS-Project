// Layout.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useRoleContext } from '@/hooks/role-context';

export default function Layout() {
	const { selectedRole, setSelectedRole, roles, routePermissions } = useRoleContext();
	const location = useLocation();
	const navigate = useNavigate();

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
		<SidebarProvider>
			<AppSidebar
				selectedRole={selectedRole}
				onRoleChange={setSelectedRole}
				roles={roles}
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