import { Link } from '@tanstack/react-router'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { Separator } from '@/components/ui/separator'
import logo from '/logos/primary_white.png'
import logoIcon from '/primary-icon.png'

export function AppSidebar() {
    const { open, isMobile } = useSidebar()

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link to="/dashboard" className="cursor-pointer">
                            <img
                                src={
                                    (open || isMobile) === true
                                        ? logo
                                        : logoIcon
                                }
                                className={
                                    (open || isMobile) === true
                                        ? 'w-auto h-auto mt-4'
                                        : 'w-8 h-10 my-2'
                                }
                                alt="Murray Logo"
                            />
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="text-center">
                        <span
                            className={
                                open === true
                                    ? 'text-white text-sm font-semibold text-center text-nowrap'
                                    : 'hidden text-nowrap ml-5'
                            }
                        >
                            COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
                        </span>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator className="my-2" />
            <SidebarContent>
                <NavMain />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
