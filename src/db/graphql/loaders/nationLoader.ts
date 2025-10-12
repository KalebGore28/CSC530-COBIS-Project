import DataLoader from "dataloader";
import { inArray } from 'drizzle-orm';
import { nations } from "../../schema";
import type { DbConnection } from "../..";

type Nation = typeof nations.$inferSelect;

export function createNationsLoader(db: DbConnection["orm"]) {
	return new DataLoader<string, Nation | null>(async (codes) => {
		// 1. Fetch all matching nation rows in one query
		const rows = await db
			.select()
			.from(nations)
			.where(inArray(nations.code, codes as string[]));

		// 2. Map code → Nation
		const rowMap = new Map<string, Nation>(
			rows.map(row => [row.code, row])
		);

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map(code => rowMap.get(code) ?? null);
	});
}
