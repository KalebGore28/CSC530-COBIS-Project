import { useState } from "react";
import { createFileRoute } from '@tanstack/react-router'
import { useSession } from "@/components/provider/session";

import { type ExtendedTerm, TermSelector } from "@/components/selectors/term-selector";
import { type ExtendedCourse, CourseSelector } from "@/components/selectors/course-selector";

// import { Roster } from "@/components/roster";
import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { RosterSummaryCard } from "@/components/roster/roster-summary-card";
import { RosterStudents } from "@/components/roster/roster-students";

export const Route = createFileRoute('/_authenticated/_layout/class-roster')({
  component: ClassRosterPage,
})

function ClassRosterPage() {
  const { session } = useSession();

  const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

  if (!session || !session.mnumber) return null;

  return (
    <div className="container p-6 mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Class Roster</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2">
        {/* Term Selector */}
        <TermSelector
          className={"col-span-2 md:col-span-1"}
          showStats={true}
          mnumber={session.mnumber}
          onTermSelect={setSelectedTerm}
        />
        {/* Course Selector */}
        {selectedTerm && (
          <CourseSelector
            className={"col-span-2 md:col-span-1"}
            showStats={true}
            mnumber={session.mnumber}
            selectedTerm={selectedTerm}
            onCourseSelect={setSelectedCourse}
          />
        )}

        {/* Roster and Info Cards */}
        {selectedTerm && selectedCourse && (
          <>
            <RosterInfoCard
              className={"col-span-2"}
              course={selectedCourse}
              term={selectedTerm}
            />
            <RosterGradeDistributions
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
            />
          </>
        )}
      </div>
    </div>
  );
};