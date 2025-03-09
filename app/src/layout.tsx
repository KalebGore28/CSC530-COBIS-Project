import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "./components/mode-toggle.tsx"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbLink,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Slash } from "lucide-react"

export default function Layout({ user }: { user: any }) {
	const location = useLocation()
	const navigate = useNavigate()

	// Generate breadcrumb items from the current pathname
	const pathSegments = location.pathname.split("/").filter(Boolean)
	const breadcrumbs = pathSegments.map((segment, index) => {
		const path = `/${pathSegments.slice(0, index + 1).join("/")}`
		// Replace hyphens with spaces and capitalize each word
		const title = segment
			.replace(/-/g, " ")
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
		return { path, title }
	})

	const redirect = (path: string) => {
		navigate(path)
	}

	return (
		<SidebarProvider>
			<AppSidebar className="bg-blue-950" user={user} redirect={redirect} />
			<main className="flex-1">
				<div className="flex items-center relative">
					<SidebarTrigger variant="outline" className="m-4" />
					<Breadcrumb className="border-l-1 border-gray-200 pl-4">
						<BreadcrumbList>
							{breadcrumbs.map((crumb, index) => (
								<React.Fragment key={crumb.path}> {/* Add key to the Fragment */}
									<BreadcrumbItem key={crumb.path}> {/* Keep key on BreadcrumbItem for its own identity */}
										{index < breadcrumbs.length - 1 ? (
											<BreadcrumbLink asChild>
												<Link to={crumb.path}>{crumb.title}</Link>
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage>{crumb.title}</BreadcrumbPage>
										)}
									</BreadcrumbItem>
									{index < breadcrumbs.length - 1 && (
										<BreadcrumbSeparator>
											<Slash className="h-4 w-4" />
										</BreadcrumbSeparator>
									)}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
					<ModeToggle className="absolute right-4 top-4" />
				</div>
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</SidebarProvider>
	)
}