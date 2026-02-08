import {
    Binoculars,
    ChartColumnIncreasing,
    Clipboard,
    Compass,
    PersonStanding,
    ScanSearch,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthentication } from '@/lib/auth-client'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import { programsCollection } from '@/integrations/tanstack-db/programs'
import { coursesCollection } from '@/integrations/tanstack-db/courses'

export function NavMain() {
    const { userSession } = useAuthentication()
    if (!userSession) return null
    const roles = userSession.roles

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem
                            key="dashboard"
                            className="text-nowrap"
                        >
                            <SidebarMenuButton tooltip="Dashboard">
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
                            <SidebarMenuButton tooltip="Class Roster">
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
                            <SidebarMenuButton tooltip={'Advisor Page'}>
                                <Link
                                    to="/advisor-page"
                                    className="w-full h-full flex items-center gap-2"
                                >
                                    <Binoculars />
                                    Advisor Page
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {roles.has('department_chair') && (
                            <SidebarMenuItem
                                key="student-lookup"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton tooltip="Student Lookup">
                                    <Link
                                        to="/student-lookup"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <ScanSearch />
                                        Student Lookup
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {roles.has('department_chair') && (
                            <SidebarMenuItem
                                key="instructors"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton tooltip="Instructors">
                                    <Link
                                        to="/instructors"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <PersonStanding />
                                        Instructors
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupLabel>Reporting</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {(roles.has('department_chair') ||
                            roles.has('admin_assistant')) && (
                            <SidebarMenuItem
                                key="enrollment-metrics"
                                className="text-nowrap"
                            >
                                <SidebarMenuButton
                                    tooltip={'Enrollment Metrics'}
                                >
                                    <Link
                                        to="/enrollment"
                                        className="w-full h-full flex items-center gap-2"
                                    >
                                        <ChartColumnIncreasing />
                                        Enrollment Metrics
                                    </Link>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton className="text-white">
                                            <Link
                                                to="/enrollment/programs"
                                                className="w-full h-full flex items-center gap-2"
                                            >
                                                Programs
                                            </Link>
                                            <SidebarMenuBadge>
                                                {programsCollection.size}
                                            </SidebarMenuBadge>
                                        </SidebarMenuSubButton>
                                        <SidebarMenuSubButton className="text-white">
                                            <Link
                                                to="/enrollment/courses"
                                                className="w-full h-full flex items-center gap-2"
                                            >
                                                Courses
                                            </Link>
                                            <SidebarMenuBadge>
                                                {coursesCollection.size}
                                            </SidebarMenuBadge>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    )
}
