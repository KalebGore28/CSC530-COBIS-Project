import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Roster } from '@/components/roster';

export const Route = createFileRoute(
  '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/$courseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/_layout/instructors/$mnumber/term-history/$yearTerm/$courseId' })
  const mnumber = params.mnumber!
  const yearTerm = params.yearTerm!
  const courseId = params.courseId!
  const navigate = useNavigate();

  const termCode = yearTerm?.slice(-2);
  const year = parseInt(yearTerm?.slice(0, 4) || '0', 10);

  const courseProps = courseId.match(/^([A-Z]+)(\d+)([A-Za-z]*)(?:-|_)(.+)$/);

  const course = {
    subject: courseProps ? courseProps[1] : '',
    number: courseProps ? parseInt(courseProps[2]) : 0,
    suffix: courseProps ? courseProps[3] : '',
    section: courseProps ? courseProps[4] : '',
  }

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="flex flex-col">
        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => navigate({
            to: `/instructors/${mnumber}/term-history/${yearTerm}`
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Term Details
        </Button>
      </div>

        <Roster
          mnumber={mnumber}
          course={course}
          term_code={termCode}
          year={year}
         />
    </div>
  )
}
