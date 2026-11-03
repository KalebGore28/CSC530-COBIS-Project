import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChartColumnIncreasingIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HubCard } from "@/components/dashboard/hub-card";
import { useAuthentication } from "@/lib/auth-client";
import { enrollmentQuery, previousYearTerm } from "@/lib/enrollment";

// "+12 from last year", or nothing when there's no last year to compare with
function changeFromLastYear(current: number, previous: number | undefined) {
  if (previous === undefined) return undefined;
  const change = current - previous;
  if (change === 0) return "Same as last year";
  const amount = Math.abs(change).toLocaleString();
  return change > 0 ? `+${amount} from last year` : `−${amount} from last year`;
}

/**
 * The department's newest term, from the same query as the Enrollment page.
 */
export function DepartmentHubCard() {
  const { can } = useAuthentication();
  const current = useQuery(enrollmentQuery());
  const term = current.data?.term;
  const lastYear = term ? previousYearTerm(term) : undefined;
  const hasLastYear =
    !!lastYear &&
    !!current.data?.terms.some((t) => t.year === lastYear.year && t.term_id === lastYear.term_id);
  const previous = useQuery({ ...enrollmentQuery(lastYear), enabled: hasLastYear });

  const summary = current.data?.summary;
  const before = hasLastYear ? previous.data?.summary : undefined;

  return (
    <HubCard
      icon={<ChartColumnIncreasingIcon />}
      title="Department"
      description={
        current.isError
          ? current.error.message
          : summary
            ? "Your department's newest term, enrolled students only."
            : "No enrollments have been imported for your department yet."
      }
      isLoading={current.isPending}
      stats={
        summary
          ? [
              {
                label: "Students",
                value: summary.students.toLocaleString(),
                detail: changeFromLastYear(summary.students, before?.students),
              },
              {
                label: "Credit hours",
                value: summary.credit_hours.toLocaleString(),
                detail: changeFromLastYear(summary.credit_hours, before?.credit_hours),
              },
              {
                label: "Majors",
                value: summary.majors.toLocaleString(),
                detail: changeFromLastYear(summary.majors, before?.majors),
              },
              { label: "Sections", value: summary.sections.toLocaleString() },
            ]
          : []
      }
    >
      <Button variant="outline" size="sm" asChild>
        <Link to="/enrollment">Enrollment</Link>
      </Button>
      {can("instructors.view") && (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/instructors">Instructors</Link>
        </Button>
      )}
      {can("student.lookup") && (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student-lookup">Student Lookup</Link>
        </Button>
      )}
    </HubCard>
  );
}
