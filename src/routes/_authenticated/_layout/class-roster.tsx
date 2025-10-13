import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { type ExtendedTerm, TermSelector } from "@/components/selectors/term-selector";
import { type ExtendedCourse, CourseSelector } from "@/components/selectors/course-selector";
// import { Roster } from "@/components/roster";
import { createFileRoute } from '@tanstack/react-router'
import { useSession } from "@/components/provider/session";

export const Route = createFileRoute('/_authenticated/_layout/class-roster')({
  component: ClassRosterPage,
})

function ClassRosterPage() {
  const { session } = useSession();
  const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

  // const handleTermSelect = (term: ExtendedTerm) => {
  //   setSelectedTerm(term);
  //   setSelectedCourse(null);
  // };

  // const handleCourseSelect = (course: ExtendedCourse) => {
  //   setSelectedCourse(course);
  // };

  return (
    <div className="container p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Class Roster</h1>

      {!session ? (
        <Alert variant="destructive">{/* ... Auth Error ... */}</Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Term Selector */}
            <TermSelector
              mnumber={session.mnumber}
              onTermSelect={setSelectedTerm}
            />
            {/* Course Selector */}
            {selectedTerm && (
              <CourseSelector
                mnumber={session.mnumber}
                selectedTerm={selectedTerm}
                onCourseSelect={setSelectedCourse}
              />
            )}
          </div>

          {session && selectedCourse && (
            <>
              {/* <Roster
                mnumber={session.mnumber}
                selectedCourse={selectedCourse}
              /> */}
            </>
          )}
        </>
      )}
    </div>
  );
};