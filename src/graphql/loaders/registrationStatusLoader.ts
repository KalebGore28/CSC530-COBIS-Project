import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { registrationStatus } from '../../db/schema';
import type { DbConnection } from '../../db';

type RegistrationStatus = typeof registrationStatus.$inferSelect;

export function createRegistrationStatusLoader(db: DbConnection['orm']) {
	return new DataLoader<string, RegistrationStatus | null>(async (codes) => {
		const rows = await db
			.select()
			.from(registrationStatus)
			.where(inArray(registrationStatus.code, codes as string[]));

		const rowMap = new Map<string, RegistrationStatus>(rows.map((row) => [row.code, row]));

		return (codes as string[]).map((code) => rowMap.get(code) ?? null);
	});
}