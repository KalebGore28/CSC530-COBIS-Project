import { createFileRoute } from '@tanstack/react-router'
import { AdvisedStudents } from '@/components/advised-students'
import { useSession } from '@/components/provider/session'
import { useState } from 'react'

import { currentTermCollection } from '@/collections/current-term';
import { termsCollection } from '@/collections/terms';
import { eq, useLiveQuery } from '@tanstack/react-db';

import { AdvisedStudentsCard } from '@/components/advised-students/advised-students-card';
import { StudentDetailModal } from '@/components/advised-students/student-detail';

export const Route = createFileRoute('/_authenticated/_layout/advisor-page')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: currentTerm, isLoading } = useLiveQuery((q) =>
    q.from({ currentTerm: currentTermCollection })
      .leftJoin({ term: termsCollection }, ({ currentTerm, term }) =>
        eq(currentTerm.term_code, term.code)
      )
      .select(({ currentTerm, term }) => ({
        year: currentTerm.year,
        term_code: currentTerm.term_code,
        description: term?.description,
      }))
      .findOne(),
  )

  if (!session || !session.mnumber || isLoading || !currentTerm) return null;

  return <div>
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
}