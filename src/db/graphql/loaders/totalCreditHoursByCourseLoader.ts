// src/graphql/loaders/courseMetrics.ts

import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../schema';
import type { DbConnection } from '../..';

/** reuse the same key helper */
function courseKey(row: {
	term_code: string;
	year: number;
	course_subject: string;
	course_number: number;
	course_suffix: string;
}) {
	return [
		row.term_code,
		row.year,
		row.course_subject,
		row.course_number,
		row.course_suffix,
	].join('|');
}

/**
 * Batches SUM(course_hours) of studentCourses per course.
 * Key: "Fall|2025|MATH|101|A"
 * Value: total credit hours (number)
 */
export function createTotalCreditHoursByCourseLoader(
	db: DbConnection['orm']
) {
	return new DataLoader<string, number>(async (keys) => {
		const parts = keys.map((k) => k.split('|') as [
			string,
			string,
			string,
			string,
			string
		]);

		const rows = await db
			.select({
				term_code: studentCourses.term_code,
				year: studentCourses.year,
				course_subject: studentCourses.course_subject,
				course_number: studentCourses.course_number,
				course_suffix: studentCourses.course_suffix,
				sum: sql<number>`SUM(${studentCourses.course_hours})`,
			})
			.from(studentCourses)
			.where(
				sql`(
          ${studentCourses.term_code}, 
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
				studentCourses.term_code,
				studentCourses.year,
				studentCourses.course_subject,
				studentCourses.course_number,
				studentCourses.course_suffix
			);

		const map: Record<string, number> = {};
		for (const r of rows) {
			map[courseKey(r)] = r.sum ?? 0;
		}

		return keys.map((k) => map[k] ?? 0);
	});
}
