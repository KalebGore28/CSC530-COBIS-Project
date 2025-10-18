// src/graphql/loaders/courseMetrics.ts

import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

/** same composite‐key helper */
function courseKey(parts: {
	term: string;
	year: number;
	course_subject: string;
	course_number: number;
	course_suffix: string;
	course_section: string;
}) {
	return [
		parts.term,
		parts.year,
		parts.course_subject,
		parts.course_number,
		parts.course_suffix,
		parts.course_section,
	].join('|');
}

/**
 * Batches the final average (mapped via CASE→points) per course.
 * Key: "Fall|2025|MATH|101|A"
 * Value: average final points rounded to 2 decimals
 */
export function createFinalAverageByCourseLoader(
	db: DbConnection['orm']
) {
	return new DataLoader<string, number>(async (keys) => {
		const parts = keys.map((k) =>
			k.split('|') as [string, string, string, string, string, string]
		);

		// CASE mapping for final_grade
		const gradeCase = sql<number>`CASE ${studentCourses.final_grade}
      WHEN 'A' THEN 4.0
      WHEN 'B' THEN 3.0
      WHEN 'C' THEN 2.0
      WHEN 'D' THEN 1.0
      WHEN 'E' THEN 0.0
      ELSE NULL
    END`;

		// single aggregated query
		const rows = await db
			.select({
				term: studentCourses.term_code,
				year: studentCourses.year,
				course_subject: studentCourses.course_subject,
				course_number: studentCourses.course_number,
				course_suffix: studentCourses.course_suffix,
				course_section: studentCourses.course_section,
				avg_points: sql<number>`AVG(${gradeCase})`,
			})
			.from(studentCourses)
			.where(
				sql`(
          ${studentCourses.term_code},
          ${studentCourses.year},
          ${studentCourses.course_subject},
          ${studentCourses.course_number},
          ${studentCourses.course_suffix},
		  ${studentCourses.course_section}
        ) IN (${sql.join(
					parts.map(
						([term, year, subj, num, suffix, section]) =>
							sql`(${term}, ${Number(year)}, ${subj}, ${Number(num)}, ${suffix}, ${section})`
					),
					sql`, `
				)})`
			)
			.groupBy(
				studentCourses.term_code,
				studentCourses.year,
				studentCourses.course_subject,
				studentCourses.course_number,
				studentCourses.course_suffix,
				studentCourses.course_section
			);

		// map & round
		const map: Record<string, number> = {};
		for (const r of rows) {
			map[courseKey(r)] = parseFloat(Number(r.avg_points ?? 0).toFixed(2));
		}

		return keys.map((k) => map[k] ?? 0);
	});
}
