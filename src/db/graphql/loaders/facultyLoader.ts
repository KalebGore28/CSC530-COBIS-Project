import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { faculty } from '../../schema';
import type { DbConnection } from '../..';

type Faculty = typeof faculty.$inferSelect;

export function createFacultyLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Faculty | null>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(faculty)
			.where(inArray(faculty.mnumber, mnumbers as string[]));

		const rowMap = new Map<string, Faculty>(rows.map((row) => [row.mnumber, row]));

		return (mnumbers as string[]).map((mnumbers) => rowMap.get(mnumbers) ?? null);
	});
}