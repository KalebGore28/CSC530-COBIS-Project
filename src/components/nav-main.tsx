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
import { Link } from '@tanstack/react-router'
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

type MenuButtonProps = {
    item: {
        title: string
        url: string
        icon?: React.ComponentType<any>
    }
    isCollapsible?: boolean
}

function MenuButton({ item, isCollapsible }: MenuButtonProps) {
    return (
        <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {isCollapsible && <ChevronsUpDown className="ml-auto" />}
        </SidebarMenuButton>
    )
}

export function NavMain() {
    const { userSession } = useAuthentication()
    if (!userSession) return null

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {/* Dashboard */}
                    <SidebarMenuItem key="dashboard" className="text-nowrap">
                        <Link to="/dashboard">
                            <MenuButton
                                item={{
                                    title: 'Dashboard',
                                    url: '/dashboard',
                                    icon: Compass,
                                }}
                            />
                        </Link>
                    </SidebarMenuItem>

                    {/* Student Lookup */}
                    <SidebarMenuItem
                        key="student-lookup"
                        className="text-nowrap"
                    >
                        <Link to="/student-lookup">
                            <MenuButton
                                item={{
                                    title: 'Student Lookup',
                                    url: '/student-lookup',
                                    icon: ScanSearch,
                                }}
                            />
                        </Link>
                    </SidebarMenuItem>

                    {/* Instructors */}
                    <SidebarMenuItem key="instructors" className="text-nowrap">
                        <Link to="/instructors">
                            <MenuButton
                                item={{
                                    title: 'Instructors',
                                    url: '/instructors',
                                    icon: PersonStanding,
                                }}
                            />
                        </Link>
                    </SidebarMenuItem>

                    {/* Class Roster */}
                    <SidebarMenuItem key="class-roster" className="text-nowrap">
                        <Link to="/class-roster">
                            <MenuButton
                                item={{
                                    title: 'Class Roster',
                                    url: '/class-roster',
                                    icon: BookOpen,
                                }}
                            />
                        </Link>
                    </SidebarMenuItem>

                    {/* COBIS Tools */}
                    <SidebarMenuItem key="cobis-tools" className="text-nowrap">
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Link to="/cobis-tools">
                                    <MenuButton
                                        item={{
                                            title: 'COBIS Tools',
                                            url: '/cobis-tools',
                                            icon: TerminalSquareIcon,
                                        }}
                                        isCollapsible
                                    />
                                </Link>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem key="import">
                                        <Link to="/cobis-tools/import">
                                            <SidebarMenuSubButton className="text-white">
                                                Import
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem key="users">
                                        <Link to="/cobis-tools/users">
                                            <SidebarMenuSubButton className="text-white">
                                                Users
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem key="manage-tables">
                                        <Link to="/cobis-tools/manage-tables">
                                            <SidebarMenuSubButton className="text-white">
                                                Manage Tables
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarMenuItem>

                    {/* Enrollment Metrics */}
                    <SidebarMenuItem
                        key="enrollment-metrics"
                        className="text-nowrap"
                    >
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Link to="/enrollment">
                                    <MenuButton
                                        item={{
                                            title: 'Enrollment Metrics',
                                            url: '/enrollment',
                                            icon: ChartColumnIncreasing,
                                        }}
                                        isCollapsible
                                    />
                                </Link>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem key="programs">
                                        <Link to="/enrollment/programs">
                                            <SidebarMenuSubButton className="text-white">
                                                Programs
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem key="courses">
                                        <Link to="/enrollment/courses">
                                            <SidebarMenuSubButton className="text-white">
                                                Courses
                                            </SidebarMenuSubButton>
                                        </Link>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarMenuItem>

                    {/* Advisor Page */}
                    <SidebarMenuItem key="advisor-page" className="text-nowrap">
                        <Link to="/advisor-page">
                            <MenuButton
                                item={{
                                    title: 'Advisor Page',
                                    url: '/advisor-page',
                                    icon: Telescope,
                                }}
                            />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
