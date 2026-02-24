import { and, eq, useLiveQuery } from '@tanstack/react-db'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'

import { useCurrentTerm } from '@/providers/current-term-provider'
import { BookUser } from 'lucide-react'

import { studentAdvisorsCollection } from '@/integrations/tanstack-db/student-advisors'

export function AdviseesMetricCard({ mnumber }: { mnumber: string }) {
    const navigate = useNavigate()

    const { currentTerm, isLoading: isCurrentTermLoading } = useCurrentTerm()

    const { data: advisedStudents, isLoading: isAdvisedStudentsLoading } =
        useLiveQuery((q) =>
            q
                .from({ studentAdvisors: studentAdvisorsCollection })
                .where(({ studentAdvisors }) =>
                    and(
                        eq(studentAdvisors.advisor_mnumber, mnumber),
                        eq(studentAdvisors.year, currentTerm.year),
                        eq(studentAdvisors.term_id, currentTerm.term_id),
                    ),
                ),
        )

    if (isCurrentTermLoading || isAdvisedStudentsLoading) return null

    return (
        <Card
            className="hover:shadow-lg cursor-pointer h-full transition-all hover:scale-[1.02]"
            onClick={() => navigate({ to: '/advisees' })}
        >
            <CardHeader className="h-full">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                        <BookUser className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle>Advisee Metrics</CardTitle>
                </div>
                <CardDescription className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold">
                            {advisedStudents.length}
                        </span>

                        <span>
                            {advisedStudents.length === 1
                                ? 'advised student'
                                : 'advised students'}
                        </span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <div className="flex items-center gap-1 flex-wrap">
                    <span>See more details about your advisees at</span>
                    <span className="font-semibold">Advisees</span>
                </div>
            </CardFooter>
        </Card>
    )
}
