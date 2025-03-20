"use client"

import * as React from "react"
import {
	Armchair,
	BookOpen,
	CameraIcon,
	ClipboardListIcon,
	Compass,
	DatabaseIcon,
	FileCodeIcon,
	FileIcon,
	FileTextIcon,
	HelpCircleIcon,
	LayoutList,
	NotepadText,
	SearchIcon,
	Settings,
	SettingsIcon,
	Shield,
	TerminalSquareIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"

import { useNavigate } from "react-router-dom"
import { Separator } from "./ui/separator"
import { RoleSwitcher } from "./role-switcher"
import logo from "../assets/primary_white.png"
import logoIcon from "../assets/primary-icon.png"

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
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
			url: "/reports",
			icon: NotepadText,
			isActive: true,
			items: [
				{ title: "Student Reports", url: "/reports/students" },
				// { title: "Course Reports", url: "/reports/courses" },
				// { title: "Department Reports", url: "/reports/departments" },
			],
		},
		// {
		// 	title: "Models",
		// 	url: "/models",
		// 	icon: Bot,
		// 	items: [
		// 		{ title: "Genesis", url: "/models/genesis" },
		// 		{ title: "Explorer", url: "/models/explorer" },
		// 		{ title: "Quantum", url: "/models/quantum" },
		// 	],
		// },
		// {
		// 	title: "Documentation",
		// 	url: "/documentation",
		// 	icon: BookOpen,
		// 	items: [
		// 		{ title: "Introduction", url: "/documentation/introduction" },
		// 		{ title: "Get Started", url: "/documentation/get-started" },
		// 		{ title: "Tutorials", url: "/documentation/tutorials" },
		// 		{ title: "Changelog", url: "/documentation/changelog" },
		// 	],
		// },
		// {
		// 	title: "Settings",
		// 	url: "/settings",
		// 	icon: Settings2,
		// 	items: [
		// 		{ title: "General", url: "/settings/general" },
		// 		{ title: "Team", url: "/settings/team" },
		// 		{ title: "Billing", url: "/settings/billing" },
		// 		{ title: "Limits", url: "/settings/limits" },
		// 	],
		// },
		{
			title: "COBIS Tools",
			url: "/cobis-tools",
			icon: TerminalSquareIcon,
			items: [
				{ title: "Query Builder", url: "/cobis-tools/query-builder" },
				{ title: "Importing", url: "/cobis-tools/imports" },
				// { title: "Contact", url: "/cobis-tools/contact" },
			],
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: CameraIcon,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: FileTextIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: FileCodeIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: SettingsIcon,
		},
		{
			title: "Get Help",
			url: "#",
			icon: HelpCircleIcon,
		},
		{
			title: "Search",
			url: "#",
			icon: SearchIcon,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: DatabaseIcon,
		},
		{
			name: "Reports",
			url: "#",
			icon: ClipboardListIcon,
		},
		{
			name: "Word Assistant",
			url: "#",
			icon: FileIcon,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open, openMobile, isMobile } = useSidebar();

	// Derive isExpanded from open and openMobile
	const isExpanded = isMobile ? openMobile : open;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<div
							className="cursor-pointer"
							onClick={() => {
								const navigate = useNavigate()
								navigate("/dashboard")
							}}
						>
							<img
								src={isExpanded ? logo : logoIcon}
								className={isExpanded ? "w-auto h-auto mt-4" : "w-8 h-9 my-2"}
								alt="Murray Logo"
							/>
						</div>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<span
							className={
								isExpanded
									? "text-white text-sm font-semibold text-center text-nowrap"
									: "hidden text-nowrap"
							}
						>
							COBIS Tool v0.0.1
						</span>
					</SidebarMenuItem>
					<Separator />
					<RoleSwitcher
						
						roles={data.roles}
						selectedRole={data.roles[0]}
						onRoleChange={(role) => console.log("Role changed to:", role)}
					/>

				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	)
}
