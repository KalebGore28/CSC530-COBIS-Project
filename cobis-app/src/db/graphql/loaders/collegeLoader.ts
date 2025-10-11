import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { colleges } from '../../schema';
import type { DbConnection } from '../../';

type College = typeof colleges.$inferSelect;

export function createCollegeLoader(db: DbConnection['orm']) {
	return new DataLoader<string, College | null>(async (codes) => {
		// 1. Fetch all matching college rows in one query
		const rows = await db
			.select()
			.from(colleges)
			.where(inArray(colleges.code, codes as string[]));

		// 2. Map id → College
		const rowMap = new Map<string, College>(rows.map((row) => [row.code, row]));

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}