import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { user } from '../../schema';
import type { DbConnection } from '../../';

type User = typeof user.$inferSelect;

export function createUserLoader(db: DbConnection['orm']) {
	return new DataLoader<string, User | null>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(user)
			.where(inArray(user.mnumber, mnumbers as string[]));

		const rowMap = new Map<string, User>(
			rows.filter((row) => row.mnumber !== null).map((row) => [row.mnumber as string, row]),
		);

		return (mnumbers as string[]).map((mnumber) => rowMap.get(mnumber) ?? null);
	});
}