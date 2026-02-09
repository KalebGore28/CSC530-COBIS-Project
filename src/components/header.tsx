import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Slash } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from '@/providers/theme'
import { useBreadcrumb } from '@/providers/breadcrumb'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function SiteHeader() {
    const location = useLocation()
    const { segmentOverrides } = useBreadcrumb()

    // Generate breadcrumb items from the current pathname
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`

        // Check if we have an override for this segment
        if (segmentOverrides[segment]) {
            return { path, title: segmentOverrides[segment] }
        }

        // Otherwise, use the default formatting
        const title = segment
            .replace(/-/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        return { path, title }
    })

    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumb className="border-l-1 border-gray-200 pl-4">
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.path}>
                                <BreadcrumbItem key={crumb.path}>
                                    {index < breadcrumbs.length - 1 ? (
                                        <BreadcrumbLink asChild>
                                            <Link to={crumb.path}>
                                                {crumb.title}
                                            </Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>
                                            {crumb.title}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && (
                                    <BreadcrumbSeparator>
                                        <Slash className="h-4 w-4" />
                                    </BreadcrumbSeparator>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <ModeToggle className="mr-4" />
        </header>
    )
}
