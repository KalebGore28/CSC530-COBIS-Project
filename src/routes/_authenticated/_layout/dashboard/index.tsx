import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { TermGradeDistribution } from '@/components/charts/term-grade-distributions'
import { useCurrentTerm } from '@/providers/current-term-provider'
import { useAuthentication } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/_layout/dashboard/')({
    component: DashboardPage,
})

const gradeDistributionRoles = ['faculty', 'department_chair']

function DashboardPage() {
    const { userSession } = useAuthentication()
    if (!userSession) return null

    const { isLoading } = useCurrentTerm()

    return (
        <div className="container p-6 mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
                <h2 className="col-span-full text-center font-bold text-2xl">
                    Welcome Back, {userSession.user.name}
                </h2>
                <p className="text-muted-foreground col-span-full text-center">
                    Access your tools and information from this dashboard
                </p>
            </div>

            <Separator />

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
