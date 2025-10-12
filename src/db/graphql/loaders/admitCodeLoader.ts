import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { admitCodes } from '../../schema';
import type { DbConnection } from '../..';

type AdmitCode = typeof admitCodes.$inferSelect;

export function createAdmitCodeLoader(db: DbConnection['orm']) {
	return new DataLoader<string, AdmitCode | null>(async (codes) => {
		// 1. Fetch all matching college rows in one query
		const rows = await db
			.select()
			.from(admitCodes)
			.where(inArray(admitCodes.code, codes as string[]));

		// 2. Map id → College
		const rowMap = new Map<string, AdmitCode>(rows.map((row) => [row.code, row]));

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}