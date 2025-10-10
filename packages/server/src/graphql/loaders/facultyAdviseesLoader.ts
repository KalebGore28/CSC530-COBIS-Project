import DataLoader from 'dataloader';
import { students, studentAdvisors } from '../../db/schema';
import { inArray, eq, sql } from 'drizzle-orm';
import type { DbConnection } from '../../db';

export type StudentAdvisorRecord = {
	student_mnumber: string;
	term: string;
	year: number;
	advisor_mnumber: string;
};

export function createFacultyAdviseesLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAdvisorRecord[]> {
	return new DataLoader<string, StudentAdvisorRecord[]>(async (advisorIds) => {
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
		const map = new Map<string, StudentAdvisorRecord[]>();
		for (const row of rows) {
			const list = map.get(row.advisor_mnumber) || [];
			list.push(row as StudentAdvisorRecord);
			map.set(row.advisor_mnumber, list);
		}

		// Return in the same order as advisorIds
		return advisorIds.map((id) => map.get(id) ?? []);
	});
}