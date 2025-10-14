import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { departments } from '../../db/schema';
import type { DbConnection } from '../../db';

type Department = typeof departments.$inferSelect;

export function createDepartmentLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Department | null>(async (codes) => {
		const rows = await db
			.select()
			.from(departments)
			.where(inArray(departments.code, codes as string[]));

		const rowMap = new Map<string, Department>(rows.map((row) => [row.code, row]));

		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}