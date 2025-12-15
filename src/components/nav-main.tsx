import {
    BookOpen,
    ChartColumnIncreasing,
    ChevronsUpDown,
    Compass,
    PersonStanding,
    ScanSearch,
    Telescope,
    TerminalSquareIcon,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { hasRouteAccess } from '../providers/session'
import { useAuthentication } from '@/lib/auth-client'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'

const nav_main_data = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Compass,
    },
    {
        title: ' Student Lookup',
        url: '/student-lookup',
        icon: ScanSearch,
    },
    {
        title: ' Instructors',
        url: '/instructors',
        icon: PersonStanding,
    },
    {
        title: 'Class Roster',
        url: '/class-roster',
        icon: BookOpen,
    },
    {
        title: 'COBIS Tools',
        url: '/cobis-tools',
        icon: TerminalSquareIcon,
        items: [
            { title: 'Import', url: '/cobis-tools/import' },
            { title: 'Users', url: '/cobis-tools/users' },
            { title: 'Manage Tables', url: '/cobis-tools/manage-tables' },
        ],
    },
    {
        title: 'Enrollment Metrics',
        url: '/enrollment',
        icon: ChartColumnIncreasing,
        items: [
            { title: 'Programs', url: '/enrollment/programs' },
            { title: 'Courses', url: '/enrollment/courses' },
        ],
    },
    {
        title: 'Advisor Page',
        url: '/advisor-page',
        icon: Telescope,
    },
]

export function NavMain({ open }: { open?: boolean }) {
    const { userSession } = useAuthentication()
    const navigate = useNavigate()
    if (!userSession) return null

    // Filter nav_main_data based on user roles and route permissions
    const filtered_nav_main_data = nav_main_data.filter((item) =>
        hasRouteAccess(item.url, userSession.roles),
    )

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {filtered_nav_main_data.map((item) => (
                        <SidebarMenuItem
                            key={item.title}
                            className="text-nowrap"
                        >
                            {item.items && item.items.length > 0 ? (
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            onClick={() => {
                                                if (!open)
                                                    navigate({ to: item.url })
                                            }}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronsUpDown className="ml-auto" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem
                                                    key={subItem.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        onClick={() =>
                                                            navigate({
                                                                to: subItem.url,
                                                            })
                                                        }
                                                        className="text-white"
                                                    >
                                                        {subItem.title}
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            ) : (
                                <SidebarMenuButton
                                    onClick={() => navigate({ to: item.url })}
                                    tooltip={item.title}
                                >
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
