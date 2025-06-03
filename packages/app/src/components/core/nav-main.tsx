import { ChevronRight, type LucideIcon } from "lucide-react"
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
import { useNavigate } from "react-router-dom"

export function NavMain({
	items,
}: {
	items: {
		title: string
		url: string
		icon?: LucideIcon
		items?: { title: string; url: string }[]
	}[]
	redirect?: (path: string) => void
}) {
	const navigate = useNavigate()
	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title} className="text-nowrap">
							{item.items && item.items?.length > 0 ? (
								<Collapsible>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip={item.title}
											onClick={() => navigate(item.url)}
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
													<SidebarMenuSubButton onClick={() => navigate(subItem.url)}>
														<span>{subItem.title}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</Collapsible>
							) : (
								<SidebarMenuButton onClick={() => navigate(item.url)} tooltip={item.title}>
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