import DataLoader from 'dataloader';
import { sql, and, eq } from 'drizzle-orm';
import { studentCourses, studentAcademicInfo } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

/** reuse same key helper */
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
 * Batches AVG(studentAcademicInfo.overall_gpa) per course.
 * Key: "Fall|2025|MATH|101|A"
 * Value: class GPA rounded to 2 decimals
 */
export function createClassGpaByCourseLoader(
	db: DbConnection['orm']
) {
	return new DataLoader<string, number>(async (keys) => {
		// 1. split keys back into parts
		const parts = keys.map((k) =>
			k.split('|') as [string, string, string, string, string]
		);

		// 2. single JOIN+GROUP BY query
		const rows = await db
			.select({
				term: studentCourses.term,
				year: studentCourses.year,
				course_subject: studentCourses.course_subject,
				course_number: studentCourses.course_number,
				course_suffix: studentCourses.course_suffix,
				avg: sql<number>`AVG(${studentAcademicInfo.overall_gpa})`,
			})
			.from(studentCourses)
			.innerJoin(
				studentAcademicInfo,
				and(
					eq(studentAcademicInfo.mnumber, studentCourses.mnumber),
					eq(studentAcademicInfo.term, studentCourses.term),
					eq(studentAcademicInfo.year, studentCourses.year)
				)
			)
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
			)
			.all();

		// 3. map results back to keys
		const map: Record<string, number> = {};
		for (const r of rows) {
			// parse & round to two decimals
			map[courseKey(r)] = parseFloat(Number(r.avg ?? 0).toFixed(2));
		}

		// 4. return in original key order
		return keys.map((k) => map[k] ?? 0);
	});
}
