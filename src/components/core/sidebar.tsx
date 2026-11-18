import { Link, linkOptions, type AnyRouter, type LinkOptions } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
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
import logoPrimaryWhite from "/logos/primary-white.avif";
import logoPrimaryNavy from "/logos/primary-navy.avif";
import logoShield from "/logos/primary-shield.avif";
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
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { userSession, can } = useAuthentication();
  if (!userSession) return null;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              to="/dashboard"
              className="flex cursor-pointer items-center"
              onClick={() => setOpenMobile(false)}
            >
              {/* Only the logo for the sidebar's current width is rendered, so the others aren't downloaded.
                  The image is the link's only content, so its alt text says where the link goes. */}
              {open || isMobile ? (
                <>
                  {/* Navy in light mode, white in dark mode. A lazy image that's hidden isn't
                      fetched until shown, so only the one for the current theme downloads. */}
                  <img
                    src={logoPrimaryNavy}
                    width={800}
                    height={148}
                    loading="lazy"
                    className="mt-4 h-auto w-auto dark:hidden"
                    alt="COBIS dashboard"
                  />
                  <img
                    src={logoPrimaryWhite}
                    width={800}
                    height={148}
                    loading="lazy"
                    className="mt-4 hidden h-auto w-auto dark:block"
                    alt="COBIS dashboard"
                  />
                </>
              ) : (
                <img
                  src={logoShield}
                  width={94}
                  height={120}
                  className="h-10 w-8"
                  alt="COBIS dashboard"
                />
              )}
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem className="text-center">
            {/* Not a heading, so each page's own <h1> is the only one */}
            <p
              className={
                open === true
                  ? "text-sidebar-foreground text-center text-sm text-nowrap"
                  : "ml-5 hidden text-nowrap"
              }
            >
              COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
            </p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <NavItem
              key="dashboard"
              tooltip="Dashboard"
              icon={Compass}
              link={linkOptions({ to: "/dashboard" })}
            >
              Dashboard
            </NavItem>
            {can("roster.view") && (
              <NavItem
                key="class-roster"
                tooltip="Class Roster"
                icon={Clipboard}
                link={linkOptions({ to: "/class-roster" })}
              >
                Class Roster
              </NavItem>
            )}
            {/* Faculty can see their own grade distribution and teaching history (story 3) */}
            {can("roster.view") && userSession?.user.mnumber && (
              <NavItem
                key="my-teaching"
                tooltip="My Teaching"
                icon={ChartNoAxesColumn}
                link={linkOptions({
                  to: "/instructors/$mnumber",
                  params: { mnumber: userSession.user.mnumber },
                })}
              >
                My Teaching
              </NavItem>
            )}
            {can("advisees.view") && (
              <NavItem
                key="advisor-page"
                tooltip="Advisor Page"
                icon={BookUser}
                link={linkOptions({ to: "/advisees" })}
              >
                Advisees
              </NavItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        {/* The same three pages, in the same order, as the dashboard's Department card */}
        {(can("enrollment.view") || can("instructors.view") || can("student.lookup")) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {can("enrollment.view") && (
                <NavItem
                  key="enrollment"
                  tooltip="Enrollment"
                  icon={ChartColumnIncreasing}
                  link={linkOptions({ to: "/enrollment" })}
                >
                  Enrollment
                </NavItem>
              )}
              {can("instructors.view") && (
                <NavItem
                  key="instructors"
                  tooltip="Instructors"
                  icon={PersonStanding}
                  link={linkOptions({ to: "/instructors" })}
                >
                  Instructors
                </NavItem>
              )}
              {can("student.lookup") && (
                <NavItem
                  key="student-lookup"
                  tooltip="Student Lookup"
                  icon={ScanSearch}
                  link={linkOptions({ to: "/student-lookup" })}
                >
                  Student Lookup
                </NavItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
        {can("tools.manage") && (
          <SidebarGroup>
            <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem
                key="manage-users"
                tooltip="Manage Users"
                icon={Users}
                link={linkOptions({ to: "/tools/users" })}
              >
                Manage Users
              </NavItem>
              <NavItem
                key="permissions"
                tooltip="Permissions"
                icon={ShieldCheck}
                link={linkOptions({ to: "/tools/permissions" })}
              >
                Permissions
              </NavItem>
              <NavItem
                key="manage-tables"
                tooltip="Manage Tables"
                icon={Table}
                link={linkOptions({ to: "/tools/manage-tables" })}
              >
                Manage Tables
              </NavItem>
              <NavItem
                key="import-data"
                tooltip="Import Data"
                icon={Upload}
                link={linkOptions({ to: "/tools/import" })}
              >
                Import Data
              </NavItem>
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

/**
 * One page in the sidebar. The page you're on is highlighted (the link carries aria-current="page"),
 * phones get 44px-tall touch targets, and choosing a page on a phone closes the drawer so the page
 * is visible. Radix then returns focus to the menu button.
 */
function NavItem({
  tooltip,
  icon: Icon,
  link,
  children,
}: {
  tooltip: string;
  icon: LucideIcon;
  // Build it with linkOptions() so the route and its params are checked where it's written
  link: LinkOptions<AnyRouter, string, string>;
  children: React.ReactNode;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem className="text-nowrap">
      <SidebarMenuButton
        tooltip={tooltip}
        className="aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground p-1 aria-[current=page]:font-medium max-md:h-(--control-height) max-md:px-2"
        asChild
      >
        <Link
          {...link}
          className="flex h-full w-full items-center gap-2"
          onClick={() => setOpenMobile(false)}
        >
          <Icon aria-hidden="true" />
          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
