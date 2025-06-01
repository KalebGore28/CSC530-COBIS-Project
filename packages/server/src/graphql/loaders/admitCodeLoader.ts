import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type AdmitCode, admitCodes } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createAdmitCodeLoader(db: DbConnection['orm']) {
	return new DataLoader<string, AdmitCode | null>(async (codes) => {
		// 1. Fetch all matching college rows in one query
		const rows = await db
			.select()
			.from(admitCodes)
			.where(inArray(admitCodes.code, codes as string[]))
			.all();

		// 2. Map id → College
		const rowMap = new Map<string, AdmitCode>(rows.map((row) => [row.code, row]));

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}