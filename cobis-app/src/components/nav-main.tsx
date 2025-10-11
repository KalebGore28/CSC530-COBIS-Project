import {
	Compass,
	TerminalSquareIcon,
	ScanSearch,
	PersonStanding,
	BookOpen,
	Telescope,
	ChartColumnIncreasing,
	ChevronRight,
	ChevronDown
} from "lucide-react"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuSub,
	SidebarMenuButton,
	SidebarMenuSubButton,
	SidebarMenuItem,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useNavigate } from "@tanstack/react-router"

const nav_main_data = [
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
	{
		title: "COBIS Tools",
		url: "/cobis-tools",
		icon: TerminalSquareIcon,
		items: [
			{ title: "Importing", url: "/cobis-tools/imports" },
			{ title: "Users", url: "/cobis-tools/users" },
		],
	},
	{
		title: "Enrollment Metrics",
		url: "/enrollment",
		icon: ChartColumnIncreasing,
		items: [
			{ title: "Programs", url: "/enrollment/programs" },
			{ title: "Courses", url: "/enrollment/courses" },
		],
	},
	{
		title: "Advisor Page",
		url: "/advisor-page",
		icon: Telescope,
	}
]

export function NavMain({ open }: { open?: boolean }) {
	const navigate = useNavigate()
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{nav_main_data.map((item) => (
						<SidebarMenuItem key={item.title} className="text-nowrap">
							{item.items && item.items?.length > 0 ? (
								<Collapsible>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.title}
											onClick={() => {
												if (!open) navigate({ to: item.url })
											}}
										>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title} className="text-nowrap">
													<SidebarMenuSubButton onClick={() => navigate({ to: subItem.url })}>
														<span>{subItem.title}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</Collapsible>
							) : (
								<SidebarMenuButton onClick={() => navigate({ to: item.url })} tooltip={item.title}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}