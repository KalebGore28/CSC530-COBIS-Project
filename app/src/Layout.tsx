// Layout.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate, Location, NavigateFunction } from 'react-router-dom';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useRoleContext } from '@/hooks/role-context';
import { useContentWidth } from '@/hooks/use-content-width';

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
	const { setOpen, open, isMobile, toggleSidebar } = useSidebar();

	// Enhanced version of useContentWidth that tracks user sidebar actions
	const { contentRef, trackSidebarAction } = useContentWidth({
		onNarrow: () => {
			if (!isMobile) {
				setOpen(false);
			}
		},
		onWide: () => {
			if (!isMobile) {
				setOpen(true);
			}
		}
	});

	// Override the toggleSidebar function to track user actions
	const handleToggleSidebar = () => {
		// Track that this was a user action
		trackSidebarAction(!open); // The new state will be the opposite of current
		toggleSidebar();
	};

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
			<AppSidebar onToggle={handleToggleSidebar} />
			<SidebarInset className="flex flex-col h-screen">
				<SiteHeader onToggleSidebar={handleToggleSidebar} />
				<div ref={contentRef} className="flex-1 overflow-y-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</>
	);
}