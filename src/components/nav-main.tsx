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
                            <SidebarMenuButton tooltip="Dashboard">
                                <Compass />
                                Dashboard
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    {/* Student Lookup */}
                    <SidebarMenuItem
                        key="student-lookup"
                        className="text-nowrap"
                    >
                        <Link to="/student-lookup">
                            <SidebarMenuButton tooltip="Student Lookup">
                                <ScanSearch />
                                Student Lookup
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    {/* Instructors */}
                    <SidebarMenuItem key="instructors" className="text-nowrap">
                        <Link to="/instructors">
                            <SidebarMenuButton tooltip="Instructors">
                                <PersonStanding />
                                Instructors
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    {/* Class Roster */}
                    <SidebarMenuItem key="class-roster" className="text-nowrap">
                        <Link to="/class-roster">
                            <SidebarMenuButton tooltip="Class Roster">
                                <BookOpen />
                                Class Roster
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                    {/* COBIS Tools */}
                    <SidebarMenuItem key="cobis-tools" className="text-nowrap">
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Link to="/cobis-tools">
                                    <SidebarMenuButton tooltip="COBIS Tools">
                                        <TerminalSquareIcon />
                                        COBIS Tools
                                        <ChevronsUpDown className="ml-auto" />
                                    </SidebarMenuButton>
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
                                    <SidebarMenuButton
                                        tooltip={'Enrollment Metrics'}
                                    >
                                        <ChartColumnIncreasing />
                                        Enrollment Metrics
                                        <ChevronsUpDown className="ml-auto" />
                                    </SidebarMenuButton>
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
                            <SidebarMenuButton tooltip={'Advisor Page'}>
                                <Telescope />
                                Advisor Page
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
