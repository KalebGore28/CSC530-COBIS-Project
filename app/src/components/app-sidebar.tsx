"use client"

import * as React from "react"
import {
	BookOpen,
	Compass,
	LayoutList,
	Armchair,
	Settings,
	Shield,
	Bot,
	Frame,
	Map,
	PieChart,
	Settings2,
	NotepadText,
	TerminalSquareIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { RoleSwitcher } from "@/components/role-switcher"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar"
import logo from "../assets/primary_white.png"
import logoIcon from "../assets/primary-icon.png"

const data = {
	roles: [
		{ id: 1, name: "Faculty", logo: BookOpen },
		{ id: 2, name: "Advisor", logo: Compass },
		{ id: 3, name: "Program Coordinator", logo: LayoutList },
		{ id: 4, name: "Department Chair", logo: Armchair },
		{ id: 5, name: "Administrator", logo: Settings },
		{ id: 6, name: "COBIS Admin", logo: Shield },
	],
	navMain: [
		{
			title: "Reports",
			url: "#",
			icon: NotepadText,
			isActive: true,
			items: [
				{ title: "History", url: "#" },
				{ title: "Starred", url: "#" },
				{ title: "Settings", url: "#" },
			],
		},
		{
			title: "Models",
			url: "#",
			icon: Bot,
			items: [
				{ title: "Genesis", url: "#" },
				{ title: "Explorer", url: "#" },
				{ title: "Quantum", url: "#" },
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: BookOpen,
			items: [
				{ title: "Introduction", url: "#" },
				{ title: "Get Started", url: "#" },
				{ title: "Tutorials", url: "#" },
				{ title: "Changelog", url: "#" },
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{ title: "General", url: "#" },
				{ title: "Team", url: "#" },
				{ title: "Billing", url: "#" },
				{ title: "Limits", url: "#" },
			],
		},
		{
			title: "COBIS Tools",
			url: "#",
			icon: TerminalSquareIcon,
			items: [
				{ title: "Support", url: "#" },
				{ title: "Feedback", url: "#" },
				{ title: "Contact", url: "#" },
			],
		},
	],
	projects: [
		{ name: "Design Engineering", url: "#", icon: Frame },
		{ name: "Sales & Marketing", url: "#", icon: PieChart },
		{ name: "Travel", url: "#", icon: Map },
	],
}

// Define role-based permissions
const rolePermissions: { navMain: { [key: number]: string[] }, projects: { [key: number]: string[] } } = {
	navMain: {
		1: ["Reports", "Documentation"], // Faculty
		2: ["Reports"], // Advisor
		3: ["Models"], // Program Coordinator
		4: ["Settings"], // Department Chair
		5: ["Settings"], // Administrator
		6: ["COBIS Tools"], // COBIS Admin
	},
	projects: {
		1: ["Design Engineering"], // Faculty
		3: ["Design Engineering", "Sales & Marketing"], // Program Coordinator
		5: ["Travel"], // Administrator
	},
}

export function AppSidebar({
	className,
	user,
	...props
}: React.ComponentProps<typeof Sidebar> & { user: any }) {
	const { state } = useSidebar()

	// Extract role IDs from user.roles
	const userRoleIds = user?.roles?.map((role: { role_id: number }) => role.role_id) || []
	const filteredRoles = data.roles.filter((role) => userRoleIds.includes(role.id))

	// Initialize selectedRole to the first filtered role
	const [selectedRole, setSelectedRole] = React.useState<{ id: number; name: string; logo: React.ElementType } | null>(filteredRoles[0] || null)

	// Memoize filtered data
	const filteredData = React.useMemo(() => {
		if (!selectedRole) {
			return {
				navMain: data.navMain,
				projects: data.projects,
			}
		}

		const navMain = data.navMain.filter((item) =>
			rolePermissions.navMain[selectedRole.id]?.includes(item.title)
		)
		const projects = data.projects.filter((project) =>
			rolePermissions.projects[selectedRole.id]?.includes(project.name)
		)

		return { navMain, projects }
	}, [selectedRole])

	// Handle role change
	const handleRoleChange = (role: { id: number; name: string; logo: React.ElementType } | null) => {
		console.log("Role changed to:", role)
		setSelectedRole(role)
	}

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenuItem>
					<img
						src={state === "collapsed" ? logoIcon : logo}
						className={state === "collapsed" ? "w-8 h-9 my-2" : "w-auto h-auto"}
						alt="Murray Logo"
					/>
				</SidebarMenuItem>
				<span className={state === "collapsed" ? "hidden text-nowrap" : "text-white text-sm font-semibold text-center text-nowrap"}>
					COBIS Tool v0.0.1
				</span>
				<div className="border-t border-white" />
				<RoleSwitcher roles={filteredRoles} onRoleChange={handleRoleChange} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredData.navMain} />
				<NavProjects projects={filteredData.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user.info} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}