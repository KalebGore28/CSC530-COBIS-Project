import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'
import { SiteHeader } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { CurrentTermProvider } from '@/providers/current-term-provider'

// Import collections to preload data
import { currentTermCollection } from '@/integrations/tanstack-db/current-term'
import { academicStandingCollection } from '@/integrations/tanstack-db/academic-standing'
import { admitCodesCollection } from '@/integrations/tanstack-db/admit-codes'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { instructionalMethodsCollection } from '@/integrations/tanstack-db/instructional-methods'
import { partOfTermCollection } from '@/integrations/tanstack-db/part-of-term'
import { registrationStatusCollection } from '@/integrations/tanstack-db/registration-status'
import { rolesCollection } from '@/integrations/tanstack-db/roles'
import { termsCollection } from '@/integrations/tanstack-db/terms'
import { programsCollection } from '@/integrations/tanstack-db/programs'
import { coursesCollection } from '@/integrations/tanstack-db/courses'

export const Route = createFileRoute('/_authenticated/_layout')({
    component: App,
})

function App() {
    // Preload all small to midsized collections for faster access throughout the app
    currentTermCollection.preload()
    academicStandingCollection.preload()
    admitCodesCollection.preload()
    collegesCollection.preload()
    departmentsCollection.preload()
    instructionalMethodsCollection.preload()
    partOfTermCollection.preload()
    registrationStatusCollection.preload()
    rolesCollection.preload()
    termsCollection.preload()
    programsCollection.preload()
    coursesCollection.preload()

    return (
        <CurrentTermProvider>
            <SidebarProvider>
                <TooltipProvider>
                    <Toaster richColors />
                    <AppSidebar />
                    <SidebarInset>
                        <SiteHeader />
                        <Outlet />
                    </SidebarInset>
                </TooltipProvider>
            </SidebarProvider>
        </CurrentTermProvider>
    )
}
