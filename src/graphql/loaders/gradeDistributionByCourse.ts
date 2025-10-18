import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

export type GradeCount = {
  grade: string;
  count: number;
  percentage: number;
};

// helper to join into your composite key
function courseKey({
  term,
  year,
  course_subject,
  course_number,
  course_suffix,
  course_section,
}: {
  term: string;
  year: number;
  course_subject: string;
  course_number: number;
  course_suffix: string;
  course_section: string;
}) {
  return [term, year, course_subject, course_number, course_suffix, course_section].join('|');
}

export function createFinalGradeDistributionByCourseLoader(db: DbConnection['orm']) {
  return new DataLoader<string, GradeCount[]>(async (keys) => {
    // split each composite key back into its parts
    const parts = keys.map(k => k.split('|'));
    // build an IN list of tuples: ((term, year, subj, num, suf, section), …)
    const tuples = sql.join(
      parts.map(([term, year, subject, number, suffix, section]) =>
        sql`(${term}, ${Number(year)}, ${subject}, ${Number(number)}, ${suffix}, ${section})`
      ),
      sql`, `
    );

    // single batched query: group and count per grade
    const rows = await db
      .select({
        term: studentCourses.term_code,
        year: studentCourses.year,
        course_subject: studentCourses.course_subject,
        course_number: studentCourses.course_number,
        course_suffix: studentCourses.course_suffix,
        course_section: studentCourses.course_section,
        grade: studentCourses.final_grade,
        count: sql<number>`COUNT(*)`,
      })
      .from(studentCourses)
      .where(
        sql`( ${studentCourses.term_code},
               ${studentCourses.year},
               ${studentCourses.course_subject},
               ${studentCourses.course_number},
               ${studentCourses.course_suffix},
               ${studentCourses.course_section} )
             IN (${tuples})`
      )
      .groupBy(
        studentCourses.term_code,
        studentCourses.year,
        studentCourses.course_subject,
        studentCourses.course_number,
        studentCourses.course_suffix,
        studentCourses.course_section,
        studentCourses.final_grade
      )
      .orderBy(studentCourses.final_grade);

    // first pass: group into a map keyed by the composite string
    const map = rows.reduce<Record<string, GradeCount[]>>((acc, row) => {
      const key = courseKey(row);
      const entry: GradeCount = {
        grade: row.grade ?? 'N/A',
        count: row.count,
        percentage: 0,          // to be filled in next step
      };
      (acc[key] ||= []).push(entry);
      return acc;
    }, {});

    // second pass: compute percentages per course
    for (const key of Object.keys(map)) {
      const grades = map[key];
      const total = grades.reduce((sum, g) => sum + g.count, 0);
      if (total > 0) {
        grades.forEach(g => {
          const rawPercent = (g.count / total) * 100;
          g.percentage = parseFloat(rawPercent.toFixed(2));
        });
      }
    }

    // return in same order as the incoming keys
    return keys.map(k => map[k] ?? []);
  });
}

export function createMidtermGradeDistributionByCourseLoader(db: DbConnection['orm']) {
  return new DataLoader<string, GradeCount[]>(async (keys) => {
    // split each composite key back into its parts
    const parts = keys.map(k => k.split('|'));
    // build an IN list of tuples: ((term, year, subj, num, suf, section), …)
    const tuples = sql.join(
      parts.map(([term, year, subject, number, suffix, section]) =>
        sql`(${term}, ${Number(year)}, ${subject}, ${Number(number)}, ${suffix}, ${section})`
      ),
      sql`, `
    );

    // single batched query: group and count per midterm grade
    const rows = await db
      .select({
        term: studentCourses.term_code,
        year: studentCourses.year,
        course_subject: studentCourses.course_subject,
        course_number: studentCourses.course_number,
        course_suffix: studentCourses.course_suffix,
        course_section: studentCourses.course_section,
        grade: studentCourses.midterm_grade,
        count: sql<number>`COUNT(*)`,
      })
      .from(studentCourses)
      .where(
        sql`( ${studentCourses.term_code},
               ${studentCourses.year},
               ${studentCourses.course_subject},
               ${studentCourses.course_number},
               ${studentCourses.course_suffix},
               ${studentCourses.course_section} )
             IN (${tuples})`
      )
      .groupBy(
        studentCourses.term_code,
        studentCourses.year,
        studentCourses.course_subject,
        studentCourses.course_number,
        studentCourses.course_suffix,
        studentCourses.course_section,
        studentCourses.midterm_grade
      )
      .orderBy(studentCourses.midterm_grade);

    // first pass: group into a map
    const map = rows.reduce<Record<string, GradeCount[]>>((acc, row) => {
      const key = courseKey(row);
      const entry: GradeCount = {
        grade: row.grade ?? 'Unknown',
        count: row.count,
        percentage: 0,
      };
      (acc[key] ||= []).push(entry);
      return acc;
    }, {});

    // second pass: compute percentages
    for (const key of Object.keys(map)) {
      const grades = map[key];
      const total = grades.reduce((sum, g) => sum + g.count, 0);
      if (total > 0) {
        grades.forEach(g => {
          const rawPercent = (g.count / total) * 100;
          g.percentage = parseFloat(rawPercent.toFixed(2));
        });
      }
    }

    return keys.map(k => map[k] ?? []);
  });
}
