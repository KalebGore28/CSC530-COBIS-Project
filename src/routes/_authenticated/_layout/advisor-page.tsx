import { createFileRoute } from '@tanstack/react-router'
import { AdvisedStudents } from '@/components/advised-students'

export const Route = createFileRoute('/_authenticated/_layout/advisor-page')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <div className="mx-auto p-6 w-full">
      <AdvisedStudents
        title='My Advised Students'
        mnumber={'F12345678'}
        modalOpen={true}
      />
    </div>
  </div>
}