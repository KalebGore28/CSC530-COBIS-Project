import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useCurrentTerm } from '@/providers/current-term-provider'
import { useAuthentication } from '@/lib/auth-client'

// import { Separator } from '@/components/ui/separator'
import { AdvisedStudentsCard } from '@/components/advised-students/advised-students-card'
import { StudentDetailModal } from '@/components/advised-students/student-detail'

export const Route = createFileRoute('/_authenticated/_layout/advisees')({
    component: RouteComponent,
})

function RouteComponent() {
    const { userSession } = useAuthentication()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

    const { currentTerm, isLoading } = useCurrentTerm()

    if (!userSession || !userSession.user.mnumber || isLoading) return null

    return (
        <div className="container p-4 mx-auto space-y-6">
            <>
                <h2 className="text-2xl">Current Advisees</h2>

                <AdvisedStudentsCard
                    advisorMnumber={userSession.user.mnumber}
                    term_info={currentTerm}
                    setModalOpen={setIsModalOpen}
                    setSelectedStudent={setSelectedStudent}
                />

                {selectedStudent && (
                    <StudentDetailModal
                        modalOpen={isModalOpen}
                        setModalOpen={setIsModalOpen}
                        studentMnumber={selectedStudent}
                    />
                )}
            </>
        </div>
    )
}
