import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { academicStanding } from '../../schema';
import type { DbConnection } from '../../';

type AcademicStanding = typeof academicStanding.$inferSelect;

export function createAcademicStandingLoader(db: DbConnection['orm']) {
	return new DataLoader<string, AcademicStanding | null>(async (codes) => {
		// 1. Fetch all matching college rows in one query
		const rows = await db
			.select()
			.from(academicStanding)
			.where(inArray(academicStanding.code, codes as string[]));

		// 2. Map id → College
		const rowMap = new Map<string, AcademicStanding>(rows.map((row) => [row.code, row]));

		// 3. Preserve incoming order; return `null` if not found
		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}