import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { roles } from '../../schema';
import type { DbConnection } from '../../';

type Role = typeof roles.$inferSelect;

export function createRoleLoader(db: DbConnection['orm']) {
	return new DataLoader<number, Role | null>(async (ids) => {
		const rows = await db
			.select()
			.from(roles)
			.where(inArray(roles.id, [...ids] as number[]));

		const rowMap = new Map<number, Role>(
			rows.filter((row) => row.id !== null).map((row) => [row.id as number, row]),
		);

		return (ids as number[]).map((id) => rowMap.get(id) ?? null);
	});
}