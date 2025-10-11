import DataLoader from 'dataloader';
import { students, studentAdvisors } from '../../schema';
import { inArray, eq, sql } from 'drizzle-orm';
import type { DbConnection } from '../../';

type StudentAdvisor = typeof studentAdvisors.$inferSelect;


export function createFacultyAdviseesLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAdvisor[]> {
	return new DataLoader<string, StudentAdvisor[]>(async (advisorIds) => {
		// Fetch all advisor‐student joins for the given advisors
		const rows = await db
			.select({
				student_mnumber: studentAdvisors.student_mnumber,
				term: studentAdvisors.term,
				year: studentAdvisors.year,
				advisor_mnumber: studentAdvisors.advisor_mnumber,
			})
			.from(students)
			.innerJoin(
				studentAdvisors,
				eq(students.mnumber, studentAdvisors.student_mnumber)
			)
			.where(inArray(studentAdvisors.advisor_mnumber, advisorIds as string[]))
			.orderBy(sql`${students.last_name} ASC, ${students.first_name} ASC`);

		// Group by advisor_mnumber
		const map = new Map<string, StudentAdvisor[]>();
		for (const row of rows) {
			if (row.advisor_mnumber !== null) {
				const list = map.get(row.advisor_mnumber) || [];
				list.push(row as StudentAdvisor);
				map.set(row.advisor_mnumber, list);
			}
		}

		// Return in the same order as advisorIds
		return advisorIds.map((id) => map.get(id) ?? []);
	});
}