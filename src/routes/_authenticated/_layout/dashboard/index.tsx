import { createFileRoute } from '@tanstack/react-router'
import { TermGradeDistribution } from '@/components/charts/term-grade-distributions'
import { useCurrentTerm } from '@/providers/current-term-provider'
import { useAuthentication } from '@/lib/auth-client'

import { Separator } from '@/components/ui/separator'

import { usersCollection } from '@/integrations/tanstack-db/users'
import { UserManangementCard } from '@/components/dashboard/user-management-card'
import { TableManangementCard } from '@/components/dashboard/table-management-card'
import { ImportCard } from '@/components/dashboard/import-card'
import { CurrentTermMetricCard } from '@/components/dashboard/current-courses-metric-card'
import { AdviseesMetricCard } from '@/components/dashboard/advisees-metrics-card'

export const Route = createFileRoute('/_authenticated/_layout/dashboard/')({
    beforeLoad: () => {
        usersCollection.preload()
    },
    component: DashboardPage,
})

const gradeDistributionRoles = ['faculty', 'department_chair']

function DashboardPage() {
    const { userSession } = useAuthentication()
    if (!userSession) return null

    const { isLoading } = useCurrentTerm()

    return (
        <div className="container p-4 mx-auto space-y-6">
            {userSession.roles.has('cobis_administrator') && (
                <>
                    <h2 className="text-2xl">Maintainence Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <UserManangementCard />
                        <TableManangementCard />
                        <ImportCard />
                    </div>
                    <Separator />
                </>
            )}
            {gradeDistributionRoles.some((role) =>
                userSession.roles.has(role),
            ) &&
                !isLoading && (
                    <>
                        <h2 className="text-2xl">
                            Performance/Metrics Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TermGradeDistribution
                                mnumber={userSession.user.mnumber}
                                className="col-span-2"
                                title="Term Grade Distributions"
                                description="View the distribution of class grades over your recent terms. (Each term represents all respective class grades combined)"
                            />
                            <CurrentTermMetricCard
                                mnumber={userSession.user.mnumber}
                            />
                            <AdviseesMetricCard
                                mnumber={userSession.user.mnumber}
                            />
                        </div>

                        <Separator />
                    </>
                )}
        </div>
    )
}
