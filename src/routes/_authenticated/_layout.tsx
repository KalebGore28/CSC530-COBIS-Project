import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar'
import { SiteHeader } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'

import { CurrentTermProvider } from '@/providers/current-term-provider'

// Import collections to preload data
import { currentTermCollection } from '@/collections/current-term'
import { academicStandingCollection } from '@/collections/academic-standing'
import { admitCodesCollection } from '@/collections/admit-codes'
import { collegesCollection } from '@/collections/colleges'
import { departmentsCollection } from '@/collections/departments'
import { instructionalMethodsCollection } from '@/collections/instructional-methods'
import { partOfTermCollection } from '@/collections/part-of-term'
import { registrationStatusCollection } from '@/collections/registration-status'
import { rolesCollection } from '@/collections/roles'
import { termsCollection } from '@/collections/terms'

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

    return (
        <CurrentTermProvider>
            <SidebarProvider>
                <Toaster richColors />
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </CurrentTermProvider>
    )
}
