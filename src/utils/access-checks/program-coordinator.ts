import { eq } from "drizzle-orm";
import { createTermAccessKey } from "./utils";
import type { TermAccessKey, TermEntry } from "@/types/access-checks";
import type { getDb } from "@/db";
import { programs, studentPrograms } from "@/db/schema";

import { ACCESS_LEVELS, ROLES } from "@/types/access-checks";

export async function programCoordinatorAccessCheck(
  db: ReturnType<typeof getDb>,
  userMnumber: string,
) {
  const accessibleStudents = new Set<string>();
  const termAccessMap = new Map<TermAccessKey, TermEntry>();

  const studentMnumbers = await db
    .select({
      student_mnumber: studentPrograms.mnumber,
      term_id: studentPrograms.term_id,
      year: studentPrograms.year,
    })
    .from(studentPrograms)
    // INNER JOIN: only include students actively enrolled in valid programs for which this user is the coordinator
    .innerJoin(programs, eq(studentPrograms.program_id, programs.id))
    .where(eq(programs.coordinator, userMnumber));

  studentMnumbers.forEach((s) => {
    // Add to overall accessible students
    accessibleStudents.add(s.student_mnumber);

    // Add to term-specific access map
    const key = createTermAccessKey(s.student_mnumber, s.year, s.term_id);
    termAccessMap.set(key, {
      accessLevel: ACCESS_LEVELS.FULL,
      reason: "within_program",
      role: ROLES.PROGRAM_COORDINATOR,
    });
  });

  return {
    accessibleStudents,
    termAccessMap,
  };
}
