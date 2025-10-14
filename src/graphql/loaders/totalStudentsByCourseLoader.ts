import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

/** join a StudentCourse row into our string key */
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
 * Batches COUNT(*) of studentCourses per course.
 * Key: "Fall|2025|MATH|101|A"
 * Value: number of students
 */
export function createTotalStudentsByCourseLoader(
	db: DbConnection['orm']
) {
	return new DataLoader<string, number>(async (keys) => {
		// 1. split each key back into its parts
		const parts = keys.map((k) => k.split('|') as [
			string,
			string,
			string,
			string,
			string
		]);

		// 2. build a single grouped query
		const rows = await db
			.select({
				term_code: studentCourses.term_code,
				year: studentCourses.year,
				course_subject: studentCourses.course_subject,
				course_number: studentCourses.course_number,
				course_suffix: studentCourses.course_suffix,
				count: sql<number>`COUNT(*)`,
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
							sql`(${term}, ${Number(year)}, ${subj}, ${Number(
								num
							)}, ${suffix})`
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

		// 3. map rows back into a lookup
		const map: Record<string, number> = {};
		for (const r of rows) {
			map[courseKey(r)] = r.count;
		}

		// 4. return counts in the same order as keys
		return keys.map((k) => map[k] ?? 0);
	});
}
