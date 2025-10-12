// src/graphql/loaders/instructorCourses.ts
import DataLoader from 'dataloader';
import { inArray, desc } from 'drizzle-orm';
import { type InstructorCourse, instructorCourses } from '../../db/schema';
import type { DbConnection } from '../../db';

export function createInstructorCoursesLoader(
	db: DbConnection['orm']
): DataLoader<string, InstructorCourse[]> {
	return new DataLoader<string, InstructorCourse[]>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(instructorCourses)
			.where(inArray(instructorCourses.mnumber, mnumbers as string[]))
			.orderBy(
				desc(instructorCourses.year),
				desc(instructorCourses.term)
			);

		const map = rows.reduce<Record<string, InstructorCourse[]>>((acc, row) => {
			(acc[row.mnumber] ||= []).push(row);
			return acc;
		}, {});

		return mnumbers.map((m) => map[m] ?? []);
	});
}
