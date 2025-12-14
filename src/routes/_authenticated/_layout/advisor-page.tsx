import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useSession } from '@/components/provider/session'
import { useCurrentTerm } from '@/providers/current-term-provider'

import { AdvisedStudentsCard } from '@/components/advised-students/advised-students-card'
import { StudentDetailModal } from '@/components/advised-students/student-detail'

export const Route = createFileRoute('/_authenticated/_layout/advisor-page')({
    component: RouteComponent,
})

function RouteComponent() {
    const { session } = useSession()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

    const { currentTerm, isLoading } = useCurrentTerm()

    if (!session || !session.mnumber || isLoading || !currentTerm) return null

    return (
        <div>
            <div className="mx-auto p-6 w-full">
                <AdvisedStudentsCard
                    advisorMnumber={session.mnumber}
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
            </div>
        </div>
    )
}
