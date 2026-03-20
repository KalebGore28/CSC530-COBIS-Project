import { Link } from '@tanstack/react-router'
import { useAuthentication } from '@/lib/auth-client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import logoPrimaryWhite from '/logos/primary-white.png'
import logoPrimaryNavy from '/logos/primary-navy.png'
import logoShield from '/logos/primary-shield.png'
import {
    Compass,
    BookUser,
    ScanSearch,
    PersonStanding,
    ChartColumnIncreasing,
    ChevronRight,
    Wrench,
    Clipboard,
} from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

export function AppSidebar() {
    const { open, isMobile } = useSidebar()
    const { userSession } = useAuthentication()
    if (!userSession) return null
    const roles = userSession.roles

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            to="/dashboard"
                            className="cursor-pointer flex items-center"
                        >
                            {/* Shield logo - shown when sidebar is closed */}
                            <img
                                src={logoShield}
                                className={
                                    open || isMobile ? 'hidden' : 'w-8 h-10'
                                }
                                alt="Murray Logo"
                            />
                            {/* Navy logo - shown in light mode when sidebar is open */}
                            <img
                                src={logoPrimaryNavy}
                                className={
                                    open || isMobile
                                        ? 'w-auto h-auto mt-4 dark:hidden'
                                        : 'hidden'
                                }
                                alt="Murray Logo"
                            />
                            {/* White logo - shown in dark mode when sidebar is open */}
                            <img
                                src={logoPrimaryWhite}
                                className={
                                    open || isMobile
                                        ? 'hidden w-auto h-auto mt-4 dark:block'
                                        : 'hidden'
                                }
                                alt="Murray Logo"
                            />
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="text-center">
                        <h1
                            className={
                                open === true
                                    ? 'text-sidebar-foreground text-sm text-center text-nowrap'
                                    : 'hidden text-nowrap ml-5'
                            }
                        >
                            COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
                        </h1>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem
                            key="dashboard"
                            className="text-nowrap"
                        >
                            <SidebarMenuButton
                                tooltip="Dashboard"
                                className="p-1"
                                asChild
                            >
                                <Link
                                    to="/dashboard"
                                    className="w-full h-full flex items-center gap-2"
                                >
                                    <Compass />
                                    Dashboard
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem
                            key="class-roster"
                            className="text-nowrap"
                        >
                            <SidebarMenuButton
                                tooltip="Class Roster"
                                className="p-1"
                                asChild
                            >
                                <Link
                                    to="/class-roster"
                                    className="w-full h-full flex items-center gap-2"
                                >
                                    <Clipboard />
                                    Class Roster
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem
                            key="advisor-page"
                            className="text-nowrap"
                        >
                            <SidebarMenuButton
                                tooltip={'Advisor Page'}
                                className="p-1"
                                asChild
                            >
                                <Link
                                    to="/advisees"
                                    className="w-full h-full flex items-center gap-2"
                                >
                                    <BookUser />
                                    Advisees
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                {roles.has('department_chair') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem
                                key="student-lookup"
                                className="text-nowrap flex items-center justify-between"
                            >
                                <SidebarMenuButton
                                    tooltip="Student Lookup"
                                    className="p-1"
                                    asChild
                                >
                                    <Link
                                        to="/student-lookup"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <ScanSearch />
                                        Student Lookup
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem
                                key="instructors"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton
                                    tooltip="Instructors"
                                    className="p-1"
                                    asChild
                                >
                                    <Link
                                        to="/instructors"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <PersonStanding />
                                        Instructors
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
                {(roles.has('department_chair') ||
                    roles.has('admin_assistant')) && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Metrics</SidebarGroupLabel>
                        <SidebarMenu>
                            <Collapsible
                                asChild
                                defaultOpen={true}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={'Enrollment Metrics'}
                                        >
                                            <ChartColumnIncreasing />
                                            Enrollments
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/enrollment/programs"
                                                        className="w-full h-full flex items-center gap-2 p-1"
                                                    >
                                                        Programs
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/enrollment/courses"
                                                        className="w-full h-full flex items-center gap-2 p-1"
                                                    >
                                                        Courses
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
                {roles.has('cobis_administrator') && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
                        <SidebarMenu>
                            <Collapsible
                                asChild
                                defaultOpen={true}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={'COBIS Tools'}
                                        >
                                            <Wrench />
                                            COBIS Tools
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/cobis-tools/users"
                                                        className="w-full h-full flex items-center gap-2 p-1"
                                                    >
                                                        Manage Users
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/cobis-tools/manage-tables"
                                                        className="w-full h-full flex items-center gap-2 p-1"
                                                    >
                                                        Manage Tables
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton asChild>
                                                    <Link
                                                        to="/cobis-tools/import"
                                                        className="w-full h-full flex items-center gap-2 p-1"
                                                    >
                                                        Import Data
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
