// src/graphql/loaders/currentTerm.ts
import DataLoader from 'dataloader';
import { sql } from 'drizzle-orm';
import { instructorCourses } from '../../schema';
import type { DbConnection } from '../..';

export function createCurrentTermLoader(
  db: DbConnection['orm']
): DataLoader<'current', { term: string; year: number }> {
  return new DataLoader<'current', { term: string; year: number }>(
    async (keys) => {
      // We only ever ask for 'current', so we do one aggregate query:
      const [row] = await db
        .select({
          year: sql<number>`MAX(${instructorCourses.year})`,
          term: sql<string>`MAX(${instructorCourses.term_code})`,
        })
        .from(instructorCourses);

      // Map every key back to that same row
      return keys.map(() => ({
        year: row.year,
        term: row.term,
      }));
    }
  );
}
