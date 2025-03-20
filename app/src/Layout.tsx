import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

import { Session } from "./App"

interface LayoutProps {
	session: Session | null;
}

export default function Layout({ session }: LayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar variant="inset" session={session} />
			<SidebarInset>
				<SiteHeader />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	)
}