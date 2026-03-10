import {
    BookUser,
    ChartColumnIncreasing,
    Clipboard,
    Compass,
    PersonStanding,
    ScanSearch,
    Wrench,
} from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useAuthentication } from '@/lib/auth-client'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar'

export function NavMain() {
    const { userSession } = useAuthentication()
    const location = useLocation()
    const { open, isMobile } = useSidebar()
    if (!userSession) return null
    const roles = userSession.roles

    function isActive(path: string) {
        const current = location.pathname.replace(/\/$/, '')
        const target = path.replace(/\/$/, '')

        return current === target || current.startsWith(`${target}/`)
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                        <SidebarMenuItem
                            key="dashboard"
                            className="text-nowrap"
                        >
                            <SidebarMenuButton
                                tooltip="Dashboard"
                                isActive={isActive('/dashboard')}
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
                                isActive={isActive('/class-roster')}
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
                                isActive={isActive('/advisor-page')}
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
                </SidebarGroupContent>
            </SidebarGroup>
            {roles.has('department_chair') && (
                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            <SidebarMenuItem
                                key="student-lookup"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton
                                    tooltip="Student Lookup"
                                    isActive={isActive('/student-lookup')}
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
                                    isActive={isActive('/instructors')}
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
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
            {(roles.has('department_chair') ||
                roles.has('admin_assistant')) && (
                <SidebarGroup>
                    <SidebarGroupLabel>Reporting</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            <SidebarMenuItem
                                key="enrollment-metrics"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton
                                    tooltip={'Enrollment Metrics'}
                                    isActive={
                                        (open || isMobile) === false &&
                                        isActive('/enrollment')
                                    }
                                    className="p-1"
                                    asChild
                                >
                                    <Link
                                        to="/enrollment"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <ChartColumnIncreasing />
                                        <span>Enrollment Metrics</span>
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem className="space-y-1">
                                        <SidebarMenuSubButton
                                            isActive={isActive(
                                                '/enrollment/programs',
                                            )}
                                            asChild
                                        >
                                            <Link
                                                to="/enrollment/programs"
                                                className="w-full h-full flex items-center gap-2 p-1"
                                            >
                                                Programs
                                            </Link>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuSubButton
                                            isActive={isActive(
                                                '/enrollment/courses',
                                            )}
                                            asChild
                                        >
                                            <Link
                                                to="/enrollment/courses"
                                                className="w-full h-full flex items-center gap-2 p-1"
                                            >
                                                Courses
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
            {roles.has('cobis_administrator') && (
                <SidebarGroup>
                    <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            <SidebarMenuItem
                                key="cobis-administrator"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton
                                    tooltip={'COBIS Tools'}
                                    isActive={
                                        (open || isMobile) === false &&
                                        isActive('/cobis-tools')
                                    }
                                    className="p-1"
                                    asChild
                                >
                                    <Link
                                        to="/cobis-tools"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <Wrench />
                                        COBIS Tools
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem className="space-y-1">
                                        <SidebarMenuSubButton
                                            isActive={isActive(
                                                '/cobis-tools/users',
                                            )}
                                            asChild
                                        >
                                            <Link
                                                to="/cobis-tools/users"
                                                className="w-full h-full flex items-center gap-2 p-1"
                                            >
                                                Manage Users
                                            </Link>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuSubButton
                                            isActive={isActive(
                                                '/cobis-tools/manage-tables',
                                            )}
                                            asChild
                                        >
                                            <Link
                                                to="/cobis-tools/manage-tables"
                                                className="w-full h-full flex items-center gap-2 p-1"
                                            >
                                                Manage Tables
                                            </Link>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuSubButton
                                            isActive={isActive(
                                                '/cobis-tools/import',
                                            )}
                                            asChild
                                        >
                                            <Link
                                                to="/cobis-tools/import"
                                                className="w-full h-full flex items-center gap-2 p-1"
                                            >
                                                Import Data
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
        </>
    )
}
