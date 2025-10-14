import DataLoader from 'dataloader';
import { studentCourses } from '../../db/schema';
import { inArray } from 'drizzle-orm';
import type { DbConnection } from '../../db';

type StudentCourse = typeof studentCourses.$inferSelect;

export function createStudentCourseLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentCourse[]> {
	return new DataLoader<string, StudentCourse[]>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(studentCourses)
			.where(inArray(studentCourses.mnumber, mnumbers as string[]));

		const map = rows.reduce<Record<string, StudentCourse[]>>((acc, row) => {
			(acc[row.mnumber] ||= []).push(row);
			return acc;
		}, {});

		return mnumbers.map((m) => map[m] ?? []);
	});
}