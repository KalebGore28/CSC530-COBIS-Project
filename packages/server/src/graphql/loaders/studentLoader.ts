import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type Student, students } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createStudentLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Student | null>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(students)
			.where(inArray(students.mnumber, mnumbers as string[]))
			.all();

		const rowMap = new Map<string, Student>(rows.map((row) => [row.mnumber, row]));

		return (mnumbers as string[]).map((mnumber) => rowMap.get(mnumber) ?? null);
	});
}