import { useEffect } from 'react';
import { useLocation, useNavigate, Location, NavigateFunction } from 'react-router-dom';
import { AppSidebar } from "@/components/core/layout/app-sidebar";
import { SiteHeader } from "@/components/core/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useRoleContext } from '@/context/role';
import { Toaster } from "@/components/ui/sonner"; // Import Toaster
import { toast } from "sonner";

interface LayoutContentProps {
	selectedRole: any; // Consider defining a specific Role type if available
	routePermissions: Record<string, string[]>;
	location: Location;
	navigate: NavigateFunction;
}

export default function Layout() {
	const { selectedRole, routePermissions } = useRoleContext();
	const location = useLocation();
	const navigate = useNavigate();

	// Ensure routePermissions is always an object, even if initially null/undefined
	const currentRoutePermissions = routePermissions || {};

	return (
		<SidebarProvider>
			<LayoutContent
				selectedRole={selectedRole}
				routePermissions={currentRoutePermissions}
				location={location}
				navigate={navigate}
			/>
			{/* Render the Toaster component here, outside LayoutContent but within the provider */}
			<Toaster richColors position="top-right" />
		</SidebarProvider>
	);
}

function LayoutContent({ selectedRole, routePermissions, location, navigate }: LayoutContentProps) {

	useEffect(() => {
		if (selectedRole) {
			const currentPath = location.pathname;
			let bestMatchKey: string | null = null;

			for (const key in routePermissions) {
				if (currentPath === key || currentPath.startsWith(key + '/')) {
					if (bestMatchKey === null || key.length > bestMatchKey.length) {
						bestMatchKey = key;
					}
				}
			}

			if (bestMatchKey) {
				const allowedRoles = routePermissions[bestMatchKey];
				if (allowedRoles && !allowedRoles.includes(selectedRole.name)) {
					// Show toast *before* navigating - Sonner should handle this correctly
					// if the <Toaster /> component is rendered persistently.
					toast.error("This page either does not exist or you do not have permission to view it.");
					console.log(`Redirecting: Path "${currentPath}" matched key "${bestMatchKey}" which requires roles [${allowedRoles.join(', ')}], but user has role "${selectedRole.name}".`);
					navigate("/dashboard", { replace: true });
				}
			}
			// Implicitly allow access if no matching key or if role is allowed.
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