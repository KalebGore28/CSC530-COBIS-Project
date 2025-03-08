"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"

export function RoleSwitcher({
	roles,
	onRoleChange,
}: {
	roles: {
		id: number
		name: string
		logo: React.ElementType
	}[]
	onRoleChange?: (role: { id: number; name: string; logo: React.ElementType } | null) => void
}) {
	const { isMobile } = useSidebar()
	const [activeRole, setActiveRole] = React.useState(roles[0]) // Default to first role

	// Set initial role only on mount
	React.useEffect(() => {
		if (roles.length > 0 && !activeRole && onRoleChange) {
			setActiveRole(roles[0])
			onRoleChange(roles[0])
		}
	}, [roles, onRoleChange]) // Runs when roles or onRoleChange changes, but only sets if activeRole is unset

	if (!activeRole) {
		return null
	}

	const handleRoleSelect = (role: { id: number; name: string; logo: React.ElementType }) => {
		setActiveRole(role)
		if (onRoleChange) {
			onRoleChange(role)
		}
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<activeRole.logo className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{activeRole.name}</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							Roles
						</DropdownMenuLabel>
						{roles.map((role, index) => (
							<DropdownMenuItem
								key={role.id}
								onClick={() => handleRoleSelect(role)}
								className="gap-2 p-2"
							>
								<div className="flex size-6 items-center justify-center rounded-sm border">
									<role.logo className="size-4 shrink-0" />
								</div>
								{role.name}
								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}