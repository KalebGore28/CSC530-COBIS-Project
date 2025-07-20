import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type UserRole, userRoles } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createUserRolesLoader(db: DbConnection['orm']) {
	return new DataLoader<string, UserRole[]>(async (ids) => {
		const rows = await db
			.select()
			.from(userRoles)
			.where(inArray(userRoles.user_id, ids as string[]));

		const map = rows.reduce<Record<string, UserRole[]>>((acc, row) => {
			(acc[row.user_id] ||= []).push(row);
			return acc;
		}, {});

		return ids.map(id => map[id] ?? []);
	});
}