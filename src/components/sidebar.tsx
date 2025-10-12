import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Separator } from "@/components/ui/separator"
import { Navigate } from "@tanstack/react-router"
import logo from "/primary_white.png"
import logoIcon from "/primary-icon.png"

export function AppSidebar() {
    const { open } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <div className="h-full bg-blue-950 dark:bg-gray-900 text-white justify-between flex flex-col">
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
                                    src={open === true ? logo : logoIcon}
                                    className={open === true ? "w-auto h-auto mt-4" : "w-8 h-10 my-2"}
                                    alt="Murray Logo"
                                />
                            </div>
                        </SidebarMenuItem>
                        <SidebarMenuItem className="text-center">
                            <span
                                className={
                                    open === true
                                        ? "text-white text-sm font-semibold text-center text-nowrap"
                                        : "hidden text-nowrap ml-5"
                                }
                            >
                                COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
                            </span>
                        </SidebarMenuItem>
                        <Separator className="my-2" />
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain open={open} />
                </SidebarContent>
                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </div>
        </Sidebar>
    )
}