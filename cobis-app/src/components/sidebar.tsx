import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Navigate } from "@tanstack/react-router"
import logo from "/primary_white.png"
import logoIcon from "/primary-icon.png"

export function AppSidebar() {
    const { open, openMobile, isMobile } = useSidebar();

    // Derive isExpanded from open and openMobile
    const isExpanded = isMobile ? openMobile : open;

    return (
        <Sidebar collapsible="icon">
            <div className="h-full bg-blue-950 dark:bg-gray-900 text-white">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    Navigate({ to: "/dashboard" })
                                }}
                            >
                                <img
                                    src={isExpanded ? logo : logoIcon}
                                    className={isExpanded ? "w-auto h-auto mt-4" : "w-8 h-10 my-2"}
                                    alt="Murray Logo"
                                />
                            </div>
                        </SidebarMenuItem>
                        <SidebarMenuItem className="text-center">
                            <span
                                className={
                                    isExpanded
                                        ? "text-white text-sm font-semibold text-center text-nowrap"
                                        : "hidden text-nowrap ml-5"
                                }
                            >
                                COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
                            </span>
                        </SidebarMenuItem>
                        <Separator className="my-2" />
                        <SidebarMenuItem>
                            {/* <RoleSwitcher /> */}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    {/* <NavMain items={filteredNavMain} /> */}
                </SidebarContent>
                <SidebarFooter>
                    {/* <NavUser session={session} onLogout={logout} /> */}
                </SidebarFooter>
            </div>
        </Sidebar>
    )
}