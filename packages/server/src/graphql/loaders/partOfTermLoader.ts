import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type PartOfTerm, partOfTerm } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createPartOfTermLoader(db: DbConnection['orm']) {
	return new DataLoader<string, PartOfTerm | null>(async (codes) => {
		// 1. Fetch all matching partOfTerm rows in one query
		const rows = await db
			.select()
			.from(partOfTerm)
			.where(inArray(partOfTerm.code, codes as string[]));

		// 2. Map code → PartOfTerm
		const rowMap = new Map<string, PartOfTerm>(rows.map((row) => [row.code, row]));

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}