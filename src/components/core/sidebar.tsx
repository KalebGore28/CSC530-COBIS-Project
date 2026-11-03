import { Link } from "@tanstack/react-router";
import { useAuthentication } from "@/lib/auth-client";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/core/nav-user";
import logoPrimaryWhite from "/logos/primary-white.png";
import logoPrimaryNavy from "/logos/primary-navy.png";
import logoShield from "/logos/primary-shield.png";
import {
  Compass,
  BookUser,
  ScanSearch,
  PersonStanding,
  ChartColumnIncreasing,
  ShieldCheck,
  Table,
  Upload,
  Users,
  ChartNoAxesColumn,
  Clipboard,
} from "lucide-react";

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const { userSession, can } = useAuthentication();
  if (!userSession) return null;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/dashboard" className="flex cursor-pointer items-center">
              {/* Shield logo - shown when sidebar is closed */}
              <img
                src={logoShield}
                className={open || isMobile ? "hidden" : "h-10 w-8"}
                alt="Murray Logo"
              />
              {/* Navy logo - shown in light mode when sidebar is open */}
              <img
                src={logoPrimaryNavy}
                className={open || isMobile ? "mt-4 h-auto w-auto dark:hidden" : "hidden"}
                alt="Murray Logo"
              />
              {/* White logo - shown in dark mode when sidebar is open */}
              <img
                src={logoPrimaryWhite}
                className={open || isMobile ? "mt-4 hidden h-auto w-auto dark:block" : "hidden"}
                alt="Murray Logo"
              />
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem className="text-center">
            <h1
              className={
                open === true
                  ? "text-sidebar-foreground text-center text-sm text-nowrap"
                  : "ml-5 hidden text-nowrap"
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
            <SidebarMenuItem key="dashboard" className="text-nowrap">
              <SidebarMenuButton tooltip="Dashboard" className="p-1" asChild>
                <Link to="/dashboard" className="flex h-full w-full items-center gap-2">
                  <Compass />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {can("roster.view") && (
              <SidebarMenuItem key="class-roster" className="text-nowrap">
                <SidebarMenuButton tooltip="Class Roster" className="p-1" asChild>
                  <Link to="/class-roster" className="flex h-full w-full items-center gap-2">
                    <Clipboard />
                    Class Roster
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {/* Faculty can see their own grade distribution and teaching history (story 3) */}
            {can("roster.view") && userSession?.user.mnumber && (
              <SidebarMenuItem key="my-teaching" className="text-nowrap">
                <SidebarMenuButton tooltip="My Teaching" className="p-1" asChild>
                  <Link
                    to="/instructors/$mnumber"
                    params={{ mnumber: userSession.user.mnumber }}
                    className="flex h-full w-full items-center gap-2"
                  >
                    <ChartNoAxesColumn />
                    My Teaching
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {can("advisees.view") && (
              <SidebarMenuItem key="advisor-page" className="text-nowrap">
                <SidebarMenuButton tooltip={"Advisor Page"} className="p-1" asChild>
                  <Link to="/advisees" className="flex h-full w-full items-center gap-2">
                    <BookUser />
                    Advisees
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        {/* The same three pages, in the same order, as the dashboard's Department card */}
        {(can("enrollment.view") || can("instructors.view") || can("student.lookup")) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {can("enrollment.view") && (
                <SidebarMenuItem key="enrollment" className="text-nowrap">
                  <SidebarMenuButton tooltip="Enrollment" className="p-1" asChild>
                    <Link to="/enrollment" className="flex h-full w-full items-center gap-2">
                      <ChartColumnIncreasing />
                      Enrollment
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {can("instructors.view") && (
                <SidebarMenuItem key="instructors" className="text-nowrap">
                  <SidebarMenuButton tooltip="Instructors" className="p-1" asChild>
                    <Link to="/instructors" className="flex h-full w-full items-center gap-2">
                      <PersonStanding />
                      Instructors
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {can("student.lookup") && (
                <SidebarMenuItem key="student-lookup" className="text-nowrap">
                  <SidebarMenuButton tooltip="Student Lookup" className="p-1" asChild>
                    <Link to="/student-lookup" className="flex h-full w-full items-center gap-2">
                      <ScanSearch />
                      Student Lookup
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
        {can("tools.manage") && (
          <SidebarGroup>
            <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem key="manage-users" className="text-nowrap">
                <SidebarMenuButton tooltip="Manage Users" className="p-1" asChild>
                  <Link to="/tools/users" className="flex h-full w-full items-center gap-2">
                    <Users />
                    Manage Users
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="permissions" className="text-nowrap">
                <SidebarMenuButton tooltip="Permissions" className="p-1" asChild>
                  <Link to="/tools/permissions" className="flex h-full w-full items-center gap-2">
                    <ShieldCheck />
                    Permissions
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="manage-tables" className="text-nowrap">
                <SidebarMenuButton tooltip="Manage Tables" className="p-1" asChild>
                  <Link to="/tools/manage-tables" className="flex h-full w-full items-center gap-2">
                    <Table />
                    Manage Tables
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="import-data" className="text-nowrap">
                <SidebarMenuButton tooltip="Import Data" className="p-1" asChild>
                  <Link to="/tools/import" className="flex h-full w-full items-center gap-2">
                    <Upload />
                    Import Data
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
