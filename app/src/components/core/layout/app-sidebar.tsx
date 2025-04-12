"use client"

import { useMemo } from "react";
import {
	Compass,
	TerminalSquareIcon,
	ScanSearch,
	PersonStanding,
	BookOpen,
} from "lucide-react"

import { NavMain } from "@/components/core/navigation/nav-main"
import { NavUser } from "@/components/core/navigation/nav-user"
import { RoleSwitcher } from "@/components/core/navigation/nav-role-switcher"
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
import { Separator } from "../../ui/separator"
import logo from "@/assets/primary_white.png"
import logoIcon from "@/assets/primary-icon.png"

import { useSession } from "@/context/session";
import { useRoleContext } from '@/context/role';

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: Compass,
		},
		{
			title: " Student Lookup",
			url: "/student-lookup",
			icon: ScanSearch,
		},
		{
			title: " Instructors",
			url: "/instructors",
			icon: PersonStanding,
		},
		{
			title: "Class Roster",
			url: "/class-roster",
			icon: BookOpen,
		},
		// {
		// 	title: "Reports",
		// 	url: "/reports",
		// 	icon: NotepadText,
		// 	items: [
		// 		{ title: "Student Reports", url: "/reports/students" },
		// 	],
		// },
		{
			title: "COBIS Tools",
			url: "/cobis-tools",
			icon: TerminalSquareIcon,
			items: [
				{ title: "Query Builder", url: "/cobis-tools/query-builder" },
				{ title: "Importing", url: "/cobis-tools/imports" },
			],
		},
		{
			title: "Test Page",
			url: "/test-page",
			icon: TerminalSquareIcon,
		}
	],
}

export function AppSidebar({ ...props }) {
	const { selectedRole, routePermissions } = useRoleContext();
	const { open, openMobile, isMobile } = useSidebar();
	const { session, logout } = useSession();
	const navigate = useNavigate()

	// Derive isExpanded from open and openMobile
	const isExpanded = isMobile ? openMobile : open;

	const filteredNavMain = useMemo(() => {
		if (!selectedRole) {
			return []; // No role selected, so no items to show
		}
		return data.navMain
			.map((item) => {
				// Handle items with sub-items (e.g., "Reports", "COBIS Tools")
				if (item.items) {
					const filteredSubItems = item.items.filter((subItem) => {
						const allowedRoles = routePermissions[subItem.url] || [];
						return allowedRoles.includes(selectedRole.name);
					});
					// Include the main item if its url is allowed or if it has accessible sub-items
					const mainAllowed = routePermissions[item.url]?.includes(selectedRole.name) || false;
					if (filteredSubItems.length > 0 || mainAllowed) {
						return { ...item, items: filteredSubItems };
					}
					return null;
				} else {
					// Handle items without sub-items (e.g., "Dashboard")
					const allowedRoles = routePermissions[item.url] || [];
					if (allowedRoles.includes(selectedRole.name)) {
						return item;
					}
					return null;
				}
			})
			.filter((item) => item !== null);
	}, [selectedRole, routePermissions]);


	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<div
							className="cursor-pointer"
							onClick={() => {
								navigate("/dashboard")
							}}
						>
							<img
								src={isExpanded ? logo : logoIcon}
								className={isExpanded ? "w-auto h-auto mt-4" : "w-8 h-10 my-2"}
								alt="Murray Logo"
							/>
						</div>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<span
							className={
								isExpanded
									? "text-white text-sm font-semibold text-center text-nowrap"
									: "hidden text-nowrap ml-5"
							}
						>
							COBIS Tool v0.5.0
						</span>
					</SidebarMenuItem>
					<Separator className="my-2" />
					<SidebarMenuItem>
						<RoleSwitcher />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredNavMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser session={session} onLogout={logout} />
			</SidebarFooter>
		</Sidebar>
	)
}
