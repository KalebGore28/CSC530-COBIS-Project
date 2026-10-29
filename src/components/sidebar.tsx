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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import logoPrimaryWhite from "/logos/primary-white.png";
import logoPrimaryNavy from "/logos/primary-navy.png";
import logoShield from "/logos/primary-shield.png";
import {
  Compass,
  BookUser,
  ScanSearch,
  PersonStanding,
  ChartColumnIncreasing,
  ChevronRight,
  Wrench,
  Clipboard,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const { userSession } = useAuthentication();
  if (!userSession) return null;
  const roles = userSession.roles;

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
            <SidebarMenuItem key="class-roster" className="text-nowrap">
              <SidebarMenuButton tooltip="Class Roster" className="p-1" asChild>
                <Link to="/class-roster" className="flex h-full w-full items-center gap-2">
                  <Clipboard />
                  Class Roster
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem key="advisor-page" className="text-nowrap">
              <SidebarMenuButton tooltip={"Advisor Page"} className="p-1" asChild>
                <Link to="/advisees" className="flex h-full w-full items-center gap-2">
                  <BookUser />
                  Advisees
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {roles.has("department_chair") && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem
                key="student-lookup"
                className="flex items-center justify-between text-nowrap"
              >
                <SidebarMenuButton tooltip="Student Lookup" className="p-1" asChild>
                  <Link to="/student-lookup" className="flex h-full w-full items-center gap-2">
                    <ScanSearch />
                    Student Lookup
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="instructors" className="text-nowrap">
                <SidebarMenuButton tooltip="Instructors" className="p-1" asChild>
                  <Link to="/instructors" className="flex h-full w-full items-center gap-2">
                    <PersonStanding />
                    Instructors
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {(roles.has("department_chair") || roles.has("admin_assistant")) && (
          <SidebarGroup>
            <SidebarGroupLabel>Metrics</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible asChild defaultOpen={true} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={"Enrollment Metrics"}>
                      <Link to={"/enrollment/programs"}>
                        <ChartColumnIncreasing />
                      </Link>
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
                            className="flex h-full w-full items-center gap-2 p-1"
                          >
                            Programs
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/enrollment/courses"
                            className="flex h-full w-full items-center gap-2 p-1"
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
        {roles.has("cobis_administrator") && (
          <SidebarGroup>
            <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible asChild defaultOpen={true} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={"COBIS Tools"}>
                      <Link to={"/cobis-tools/users"}>
                        <Wrench />
                      </Link>
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
                            className="flex h-full w-full items-center gap-2 p-1"
                          >
                            Manage Users
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/cobis-tools/manage-tables"
                            className="flex h-full w-full items-center gap-2 p-1"
                          >
                            Manage Tables
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            to="/cobis-tools/import"
                            className="flex h-full w-full items-center gap-2 p-1"
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
  );
}
