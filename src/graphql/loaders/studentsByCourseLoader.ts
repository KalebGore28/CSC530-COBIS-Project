import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

type StudentCourse = typeof studentCourses.$inferSelect;

// our “composite key” string format
function courseKey({
	term_code,
	year,
	course_subject,
	course_number,
	course_suffix,
}: {
	term_code: string;
	year: number;
	course_subject: string;
	course_number: number;
	course_suffix: string;
}) {
	return [term_code, year, course_subject, course_number, course_suffix].join('|');
}

export function createStudentsByCourseLoader(db: DbConnection['orm']) {
	return new DataLoader<string, StudentCourse[]>(async (keys) => {
		// each key is “Fall|2025|MATH|101|A”, so split back into parts
		const parts = keys.map(k => k.split('|'));
		// build a raw tuple-IN list: ( ('Fall',2025,'MATH',101,'A'), (…) )
		const tuples = sql.join(
			parts.map(([term, year, subject, number, suffix]) =>
				sql`(${term}, ${Number(year)}, ${subject}, ${Number(number)}, ${suffix})`
			),
			sql`, `
		);

		// single batched query
		const rows = await db
			.select()
			.from(studentCourses)
			.where(
				// tuple IN (…) 
				sql`( ${studentCourses.term_code}, ${studentCourses.year}, ${studentCourses.course_subject}, ${studentCourses.course_number}, ${studentCourses.course_suffix} )
             IN (${tuples})`
			)
			.orderBy(
				// preserve your ordering
				sql`${studentCourses.year} DESC, ${studentCourses.term_code} DESC`
			);

		// group by composite key
		const map = rows.reduce<Record<string, typeof rows>>((acc, row) => {
			const k = courseKey(row);
			(acc[k] ||= []).push(row);
			return acc;
		}, {});

		// preserve original key order
		return keys.map(k => map[k] ?? []);
	});
}
