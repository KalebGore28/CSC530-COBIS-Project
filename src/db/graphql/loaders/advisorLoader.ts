import DataLoader from 'dataloader';
import { inArray, sql } from 'drizzle-orm';
import { studentAdvisors } from '../../schema';
import type { DbConnection } from '../..';

type StudentAdvisor = typeof studentAdvisors.$inferSelect;

export function createAdvisorLoader(db: DbConnection['orm']) {
  return new DataLoader<string, StudentAdvisor[]>(async (mnumbers) => {
    const rows = await db
      .select()
      .from(studentAdvisors)
      .where(inArray(studentAdvisors.student_mnumber, mnumbers as string[]))
      .orderBy(sql`${studentAdvisors.year} DESC, ${studentAdvisors.term_code} DESC`);

    const map = rows.reduce<Record<string, StudentAdvisor[]>>((acc, row) => {
      (acc[row.student_mnumber] ||= []).push(row);
      return acc;
    }, {});

    return mnumbers.map(m => map[m] ?? []);
  });
}
