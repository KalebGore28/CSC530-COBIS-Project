import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import { BookUser } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useCurrentTerm } from "@/providers/current-term-provider";

import { studentAdvisorsCollection } from "@/integrations/tanstack-db/student-advisors";

export function AdviseesMetricCard({ mnumber }: { mnumber: string }) {
  const navigate = useNavigate();

  const { currentTerm, isLoading: isCurrentTermLoading } = useCurrentTerm();

  const { data: advisedStudents, isLoading: isAdvisedStudentsLoading } = useLiveQuery((q) =>
    q
      .from({ studentAdvisors: studentAdvisorsCollection })
      .where(({ studentAdvisors }) =>
        and(
          eq(studentAdvisors.advisor_mnumber, mnumber),
          eq(studentAdvisors.year, currentTerm.year),
          eq(studentAdvisors.term_id, currentTerm.term_id),
        ),
      ),
  );

  if (isCurrentTermLoading || isAdvisedStudentsLoading) return null;

  return (
    <Card
      className="h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={() => navigate({ to: "/advisees" })}
    >
      <CardHeader className="h-full">
        <div className="mb-2 flex items-center gap-2">
          <BookUser className="h-6 w-6" />

          <CardTitle>Advisee Metrics</CardTitle>
        </div>
        <CardDescription className="flex flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{advisedStudents.length}</span>

            <span>{advisedStudents.length === 1 ? "advised student" : "advised students"}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-1">
          <span>See more details about your advisees at</span>
          <span className="font-semibold">Advisees</span>
        </div>
      </CardFooter>
    </Card>
  );
}
