import DataLoader from 'dataloader';
import { inArray } from 'drizzle-orm';
import { type StudentProgram, studentPrograms } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

export function createStudentProgramLoader(db: DbConnection['orm']) {
  return new DataLoader<string, StudentProgram[]>(async (mnumbers) => {
    const rows = await db
      .select()
      .from(studentPrograms)
      .where(inArray(studentPrograms.mnumber, mnumbers as string[]))
      .all();

    const map = rows.reduce<Record<string, StudentProgram[]>>((acc, row) => {
      (acc[row.mnumber] ||= []).push(row);
      return acc;
    }, {});

    return mnumbers.map(m => map[m] ?? []);
  });
}
