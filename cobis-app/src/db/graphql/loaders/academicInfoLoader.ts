import DataLoader from 'dataloader';
import { studentAcademicInfo } from '../../schema';
import { inArray } from 'drizzle-orm';
import type { DbConnection } from '../../';

type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;

export function createAcademicInfoLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAcademicInfo[]> {
	return new DataLoader<string, StudentAcademicInfo[]>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(studentAcademicInfo)
			.where(inArray(studentAcademicInfo.mnumber, mnumbers as string[]));

		const map = rows.reduce<Record<string, StudentAcademicInfo[]>>((acc, row) => {
			(acc[row.mnumber] ||= []).push(row);
			return acc;
		}, {});

		return mnumbers.map((m) => map[m] ?? []);
	});
}