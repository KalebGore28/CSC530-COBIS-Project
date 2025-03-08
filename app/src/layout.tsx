import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "./components/mode-toggle.tsx";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function Layout({
	children,
	user
}: {
	children: React.ReactNode,
	user: any
}) {
	return (
		<SidebarProvider>
			<AppSidebar className="bg-blue-950" user={user} /> {/* Pass user to AppSidebar */}
			<main>
				<div className="flex items-center justify-around">
					<SidebarTrigger variant='outline' className="m-4" />
					<Breadcrumb className="border-l-1 border-gray-200 pl-4">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<ModeToggle className="absolute right-4 top-4" />
				</div>
				{children}
			</main>
		</SidebarProvider>
	)
}
