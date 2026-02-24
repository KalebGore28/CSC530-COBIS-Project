import { createFileRoute } from '@tanstack/react-router'
import { TermGradeDistribution } from '@/components/charts/term-grade-distributions'
import { useCurrentTerm } from '@/providers/current-term-provider'
import { useAuthentication } from '@/lib/auth-client'

import { usersCollection } from '@/integrations/tanstack-db/users'
import { UserManangementCard } from '@/components/dashboard/user-management-card'
import { TableManangementCard } from '@/components/dashboard/table-management-card'
import { ImportCard } from '@/components/dashboard/import-card'

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
        <div className="container p-6 mx-auto space-y-6">
            {userSession.roles.has('cobis_administrator') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <UserManangementCard />
                    <TableManangementCard />
                    <ImportCard />
                </div>
            )}
            {gradeDistributionRoles.some((role) =>
                userSession.roles.has(role),
            ) &&
                !isLoading && (
                    <TermGradeDistribution
                        mnumber={userSession.user.mnumber}
                        title="Term Grade Distributions"
                        description="View the distribution of class grades over your recent terms."
                    />
                )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
    )
}
