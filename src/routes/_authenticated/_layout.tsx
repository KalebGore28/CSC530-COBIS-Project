import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/sidebar';
import { SiteHeader } from '@/components/header';
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute('/_authenticated/_layout')({
  component: App,
})

function App() {
  return (
    <SidebarProvider>
      <Toaster richColors />
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
