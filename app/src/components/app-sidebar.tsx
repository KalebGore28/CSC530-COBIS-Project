"use client"

import { useMemo } from "react";
import {
	Compass,
	NotepadText,
	TerminalSquareIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { RoleSwitcher } from "@/components/role-switcher"
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
import { Session } from "../App"
import logo from "../assets/primary_white.png"
import logoIcon from "../assets/primary-icon.png"

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: Compass,
		},
		{
			title: "Reports",
			url: "/reports",
			icon: NotepadText,
			items: [
				{ title: "Student Reports", url: "/reports/students" },
				// { title: "Course Reports", url: "/reports/courses" },
				// { title: "Department Reports", url: "/reports/departments" },
			],
		},
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	session: Session | null;
	onLogout: () => void;
	selectedRole: { id: number; name: string; logo: React.ElementType } | null;
	onRoleChange: (role: { id: number; name: string; logo: React.ElementType } | null) => void;
	roles: { id: number; name: string; logo: React.ElementType }[];
	routePermissions: { [key: string]: number[] };
}

export function AppSidebar({ session, onLogout, onRoleChange, selectedRole, roles, routePermissions, ...props }: AppSidebarProps) {
	const { open, openMobile, isMobile } = useSidebar();
	const navigate = useNavigate()

	// Derive isExpanded from open and openMobile
	const isExpanded = isMobile ? openMobile : open;

	const filteredNavMain = useMemo(() => {
		if (!selectedRole) {
			return data.navMain; // Show all items if no role is selected
		}
		return data.navMain
			.map((item) => {
				// Handle items with sub-items (e.g., "Reports", "COBIS Tools")
				if (item.items) {
					const filteredSubItems = item.items.filter((subItem) => {
						const allowedRoles = routePermissions[subItem.url] || [];
						return allowedRoles.includes(selectedRole.id);
					});
					// Include the main item if its url is allowed or if it has accessible sub-items
					const mainAllowed = routePermissions[item.url]?.includes(selectedRole.id) || false;
					if (filteredSubItems.length > 0 || mainAllowed) {
						return { ...item, items: filteredSubItems };
					}
					return null;
				} else {
					// Handle items without sub-items (e.g., "Dashboard")
					const allowedRoles = routePermissions[item.url] || [];
					if (allowedRoles.includes(selectedRole.id)) {
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
									: "hidden text-nowrap"
							}
						>
							COBIS Tool v0.0.1
						</span>
					</SidebarMenuItem>
					<Separator className="my-2" />
					<SidebarMenuItem>
						<RoleSwitcher
							roles={roles}
							selectedRole={selectedRole}
							onRoleChange={onRoleChange}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredNavMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser session={session} onLogout={onLogout} />
			</SidebarFooter>
		</Sidebar>
	)
}
