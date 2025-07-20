import DataLoader from 'dataloader';
import { eq, or, and } from 'drizzle-orm';
import { type Course, courses } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

/**
 * Builds a composite key string for a course row.
 */
function courseKey(subject: string, number: number, suffix: string) {
	return `${subject}|${number}|${suffix}`;
}

export function createCourseLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Course | null>(async (keys) => {
		// 1) parse keys into components
		const comps = keys.map((key) => {
			const [subject, numStr, suffix] = key.split('|');
			return { subject, number: Number(numStr), suffix };
		});

		// 2) build a big OR(...) predicate
		const predicates = comps.map(({ subject, number, suffix }) =>
			and(
				eq(courses.subject, subject),
				eq(courses.number, number),
				eq(courses.suffix, suffix)
			)
		);

		// 3) fetch all matching rows in one query
		const rows = await db
			.select()
			.from(courses)
			.where(or(...predicates));

		// 4) map compositeKey → Course
		const rowMap = new Map<string, Course>(
			rows.map((r) => [courseKey(r.subject, r.number, r.suffix), r])
		);

		// 5) preserve ordering, null when missing
		return keys.map((key) => rowMap.get(key) ?? null);
	});
}
