import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/sidebar';
import { SiteHeader } from '@/components/header';
import { Toaster } from "@/components/ui/sonner";

// Import collections to preload data
import { academicStandingCollection } from '@/collections/academic-standing';
import { admitCodesCollection } from '@/collections/admit-codes';
import { collegesCollection } from '@/collections/colleges';
import { departmentsCollection } from '@/collections/departments';
import { instructionalMethodsCollection } from '@/collections/instructional-methods';
import { nationsCollection } from '@/collections/nations';
import { partOfTermCollection } from '@/collections/part-of-term';
import { registrationStatusCollection } from '@/collections/registration-status';
import { rolesCollection } from '@/collections/roles';
import { termsCollection } from '@/collections/terms';

export const Route = createFileRoute('/_authenticated/_layout')({
  component: App,
})

function App() {
  // Preload all small to midsized collections for faster access throughout the app
  academicStandingCollection.preload()
  admitCodesCollection.preload()
  collegesCollection.preload()
  departmentsCollection.preload()
  instructionalMethodsCollection.preload()
  nationsCollection.preload()
  partOfTermCollection.preload()
  registrationStatusCollection.preload()
  rolesCollection.preload()
  termsCollection.preload()

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
