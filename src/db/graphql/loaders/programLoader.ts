import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { programs } from '../../schema';
import type { DbConnection } from '../..';

type Program = typeof programs.$inferSelect;

export function createProgramLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Program | null>(async (codes) => {
		const rows = await db
			.select()
			.from(programs)
			.where(inArray(programs.code, codes as string[]));

		const rowMap = new Map<string, Program>(
			rows.map(row => [row.code, row])
		);

		return (codes as string[]).map(code => rowMap.get(code) ?? null);
	});
}