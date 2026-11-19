import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { useAuthentication } from "@/lib/auth-client";
import { accessReasons } from "@/lib/access-reasons";
import type { AccessFacts, AccessLookups, AccessViewer } from "@/lib/access-reasons";
import type { DataRelationship } from "@/types/access-checks";

import { coursesCollection } from "@/integrations/tanstack-db/courses";
import { programsCollection } from "@/integrations/tanstack-db/programs";
import { studentAdvisorsCollection } from "@/integrations/tanstack-db/student-advisors";

type Term = { year: number; term_id: string };

/**
 * Everything needed to explain why the viewer can see students: who they are, what each program and
 * course belongs to, and their advisees (in one term, or any term when none is given).
 */
export function useAccessReasons(term?: Term) {
  const { userSession } = useAuthentication();
  const viewer: AccessViewer = {
    mnumber: userSession?.user.mnumber || null,
    departmentId: userSession?.faculty?.department_id ?? null,
    relationships: userSession?.dataGrants.get("identity") ?? new Set<DataRelationship>(),
  };

  const { data: programs } = useLiveQuery({
    query: (q) => q.from({ programs: programsCollection }),
  });
  const { data: courses } = useLiveQuery({
    query: (q) => q.from({ courses: coursesCollection }),
  });
  const { data: advising } = useLiveQuery(
    {
      query: (q) =>
        q
          .from({ advisors: studentAdvisorsCollection })
          .where(({ advisors }) =>
            term
              ? and(
                  eq(advisors.advisor_mnumber, viewer.mnumber ?? ""),
                  eq(advisors.year, term.year),
                  eq(advisors.term_id, term.term_id),
                )
              : eq(advisors.advisor_mnumber, viewer.mnumber ?? ""),
          ),
    },
    [viewer.mnumber, term?.year, term?.term_id],
  );

  const lookups: AccessLookups = {
    programs: new Map(programs.map((program) => [program.id, program])),
    courseDepartments: new Map(courses.map((course) => [course.id, course.department_id])),
  };
  const advisees = new Set(advising.map((row) => row.mnumber));

  return {
    viewer,
    lookups,
    advisees,
    reasonsFor: (facts: Omit<AccessFacts, "advisedByViewer"> & { mnumber: string }) =>
      accessReasons({ ...facts, advisedByViewer: advisees.has(facts.mnumber) }, viewer, lookups),
  };
}
