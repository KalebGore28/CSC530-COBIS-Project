import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type Term, terms } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createTermLoader(db: DbConnection['orm']) {
	return new DataLoader<string, Term | null>(async (codes) => {
		// fetch all matching term rows in one query
		const rows = db
			.select({ code: terms.code, description: terms.description })
			.from(terms)
			.where(inArray(terms.code, codes as string[]))
			.all();

		// map code → Term
		const rowMap = new Map(rows.map(r => [r.code, r]));

		// preserve ordering, returning null if missing
		return (codes as string[]).map(code => rowMap.get(code) ?? null);
	});
}
