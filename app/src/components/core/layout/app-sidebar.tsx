"use client"

import { useMemo } from "react";
import {
	Compass,
	TerminalSquareIcon,
	ScanSearch,
	PersonStanding,
	BookOpen,
	Telescope,
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
			url: "/students/lookup",
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
		{
			title: "COBIS Tools",
			url: "/cobis-tools",
			icon: TerminalSquareIcon,
			items: [
				{ title: "Query Builder", url: "/cobis-tools/query-builder" },
				{ title: "Importing", url: "/cobis-tools/imports" },
				{ title: "Users", url: "/cobis-tools/users" },
			],
		},
		{
			title: "Advisor Page",
			url: "/advisor-page",
			icon: Telescope,
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
		// Ensure role and permissions are loaded
		if (!selectedRole || !routePermissions) {
			return [];
		}
		const roleName = selectedRole.name;

		return data.navMain
			.map((item) => {
				// Check if the main item's URL itself is allowed
				const mainPathAllowed = routePermissions[item.url]?.includes(roleName) ?? false;

				// If it has sub-items (nested menu)
				if (item.items) {
					// Filter sub-items based on their specific permissions
					const accessibleSubItems = item.items.filter(subItem =>
						routePermissions[subItem.url]?.includes(roleName) ?? false
					);

					// Show the parent item if:
					// 1. The parent item's own URL is directly accessible OR
					// 2. Any of its sub-items are accessible
					if (mainPathAllowed || accessibleSubItems.length > 0) {
						// Return the parent item, but only include the sub-items that are accessible
						return { ...item, items: accessibleSubItems };
					}
					// If neither parent nor any child is accessible, hide the parent item
					return null;
				} else {
					// If it's a top-level item without sub-items
					// Show it only if its URL is directly accessible
					return mainPathAllowed ? item : null;
				}
			})
			// Remove any null entries resulting from filtering
			.filter((item): item is NonNullable<typeof item> => item !== null);

	}, [selectedRole, routePermissions]); // Dependencies for recalculation


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
