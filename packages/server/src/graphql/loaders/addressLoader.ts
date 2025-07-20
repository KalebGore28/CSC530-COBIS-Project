import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type StudentAddress, studentAddresses } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createAddressesLoader(db: DbConnection['orm']) {
	return new DataLoader<string, StudentAddress[]>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(studentAddresses)
			.where(inArray(studentAddresses.mnumber, mnumbers as string[]));

		const map = rows.reduce<Record<string, StudentAddress[]>>((acc, row) => {
			(acc[row.mnumber] ||= []).push(row);
			return acc;
		}, {});

		return mnumbers.map(m => map[m] ?? []);
	});
}
