import { AppSidebar } from "@/components/core/layout/app-sidebar";
import { SiteHeader } from "@/components/core/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
	return (
		<SidebarProvider>
			<LayoutContent />
			<Toaster richColors position="top-right" />
		</SidebarProvider>
	);
}

function LayoutContent() {
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