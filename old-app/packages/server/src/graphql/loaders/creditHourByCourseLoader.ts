import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

/** reuse the same key helper */
function courseKey(parts: {
  term: string;
  year: number;
  course_subject: string;
  course_number: number;
  course_suffix: string;
}) {
  return [
    parts.term,
    parts.year,
    parts.course_subject,
    parts.course_number,
    parts.course_suffix,
  ].join('|');
}

/**
 * Batches one representative course_hours per course.
 * Key: "Fall|2025|MATH|101|A"
 * Value: credit_hour (number)
 */
export function createCreditHourByCourseLoader(
  db: DbConnection['orm']
) {
  return new DataLoader<string, number>(async (keys) => {
    // Split each composite key back into parts
    const parts = keys.map((k) => k.split('|') as [
      string,
      string,
      string,
      string,
      string
    ]);

    // Single grouped query: MIN(course_hours) per course
    const rows = await db
      .select({
        term: studentCourses.term,
        year: studentCourses.year,
        course_subject: studentCourses.course_subject,
        course_number: studentCourses.course_number,
        course_suffix: studentCourses.course_suffix,
        credit_hour: sql<number>`MIN(${studentCourses.course_hours})`,
      })
      .from(studentCourses)
      .where(
        sql`(
          ${studentCourses.term},
          ${studentCourses.year},
          ${studentCourses.course_subject},
          ${studentCourses.course_number},
          ${studentCourses.course_suffix}
        ) IN (${sql.join(
          parts.map(
            ([term, year, subj, num, suffix]) =>
              sql`(${term}, ${Number(year)}, ${subj}, ${Number(num)}, ${suffix})`
          ),
          sql`, `
        )})`
      )
      .groupBy(
        studentCourses.term,
        studentCourses.year,
        studentCourses.course_subject,
        studentCourses.course_number,
        studentCourses.course_suffix
      );

    // Build a lookup map
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[courseKey(r)] = r.credit_hour ?? 0;
    }

    // Return in the same order as keys
    return keys.map((k) => map[k] ?? 0);
  });
}
