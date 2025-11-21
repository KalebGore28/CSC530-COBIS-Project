import { useState } from "react";
import { createFileRoute } from '@tanstack/react-router'
import { useSession } from "@/components/provider/session";

import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { RosterSummaryCard } from "@/components/roster/roster-summary-card";
import { RosterStudents } from "@/components/roster/roster-students";

import { TermCourseSelector, SelectedCourse } from "@/components/selectors/term-course-selector";

export const Route = createFileRoute('/_authenticated/_layout/class-roster')({
  component: ClassRosterPage,
})

function ClassRosterPage() {
  const { session } = useSession();

  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);

  if (!session || !session.mnumber) return null;

  return (
    <div className="container p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Class Roster</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2">
        <TermCourseSelector
          className={"col-span-2"}
          mnumber={session.mnumber}
          showStats={true}
          selectedCourseChanged={setSelectedCourse}
        />

        {/* Roster and Info Cards */}
        {selectedCourse && (
          <>
            <RosterInfoCard
              className={"col-span-2"}
              course={selectedCourse}
            />
            {/* <RosterGradeDistributions
              className={"col-span-1"}
              mnumber={session.mnumber}
              course={selectedCourse}
            />
            <RosterSummaryCard
              className={"col-span-1"}
              totalStudents={selectedCourse.studentCount}
              classGPA={selectedCourse.classGPA}
              midtermAverage={selectedCourse.midtermAverage}
              finalAverage={selectedCourse.finalAverage}
            />
            <RosterStudents
              className={"col-span-2"}
              mnumber={session.mnumber}
              course={selectedCourse}
              term={selectedTerm}
            /> */}
          </>
        )}
      </div>
    </div>
  );
};