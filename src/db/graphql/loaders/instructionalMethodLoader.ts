import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { instructionalMethods } from '../../schema';
import type { DbConnection } from '../..';

type InstructionalMethod = typeof instructionalMethods.$inferSelect;

export function createInstructionalMethodLoader(db: DbConnection['orm']) {
	return new DataLoader<string, InstructionalMethod | null>(async (codes) => {
		const rows = await db
			.select()
			.from(instructionalMethods)
			.where(inArray(instructionalMethods.code, codes as string[]));

		const rowMap = new Map<string, InstructionalMethod>(rows.map((row) => [row.code, row]));

		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}