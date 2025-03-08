import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "./components/mode-toggle.tsx";

import { Slash } from "lucide-react"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar className="bg-blue-950" />
			<main>
				<div className="flex items-center justify-around">
					<SidebarTrigger variant='outline' className="m-4" />
					<Breadcrumb className="border-l-1 border-gray-200 pl-4">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage>Home</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<ModeToggle className="absolute right-4 top-4" /> {/* Absolute positioning */}				</div>
				{children}
			</main>
		</SidebarProvider>
	)
}
