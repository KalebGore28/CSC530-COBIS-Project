// src/graphql/loaders/gradeDistributionLoader.ts
import DataLoader from 'dataloader';
import { and, eq, gte, lte, or, count } from 'drizzle-orm';
import { instructorCourses, studentCourses } from '../../db/schema';
import type { DbConnection } from '../../db/connection';

// shape of the key we’ll stringify
type GradeDistKey = {
	mnumber: string;
	startTerm: string;
	startYear: number;
	endTerm?: string;
	endYear?: number;
};

export function createFacultyCourseGradeDistributionLoader(
	db: DbConnection['orm'],
	currentTermLoader: DataLoader<'current', { term: string; year: number }>
): DataLoader<string, Array<{
	term: { code: string; description: string };
	year: number;
	distributions: Array<{
		grade: string;
		count: number;
		percentage: number;
	}>;
}>> {
	return new DataLoader<string, Array<{
		term: { code: string; description: string };
		year: number;
		distributions: Array<{
			grade: string;
			count: number;
			percentage: number;
		}>;
	}>>(
		async (keys) => {
			return Promise.all(
				keys.map(async (key) => {
					const { mnumber, startTerm, startYear, endTerm, endYear } =
						JSON.parse(key) as GradeDistKey;

					// fill defaults for endTerm/endYear if missing
					let finalTerm = endTerm;
					let finalYear = endYear;
					if (finalTerm == null || finalYear == null) {
						const cur = await currentTermLoader.load('current');
						finalTerm = finalTerm ?? cur.term;
						finalYear = finalYear ?? cur.year;
					}

					// build predicates
					const predicates = [
						eq(instructorCourses.mnumber, mnumber),
						or(
							gte(instructorCourses.year, startYear),
							and(
								eq(instructorCourses.year, startYear),
								gte(instructorCourses.term, startTerm)
							)
						),
						or(
							lte(instructorCourses.year, finalYear),
							and(
								eq(instructorCourses.year, finalYear),
								lte(instructorCourses.term, finalTerm)
							)
						),
					];

					// aggregation query
					const rows = await db
						.select({
							term: instructorCourses.term,
							year: instructorCourses.year,
							grade: studentCourses.final_grade,
							count: count(),
						})
						.from(instructorCourses)
						.innerJoin(
							studentCourses,
							and(
								eq(instructorCourses.crn, studentCourses.crn),
								eq(instructorCourses.term, studentCourses.term),
								eq(instructorCourses.year, studentCourses.year)
							)
						)
						.where(and(...predicates))
						.groupBy(
							instructorCourses.term,
							instructorCourses.year,
							studentCourses.final_grade
						)
						.all();
					// bucket by “term-year”
					const buckets: Record<string, Array<{ grade: string | null; count: number }>> = {};
					for (const r of rows) {
						const k = `${r.term}-${r.year}`;
						(buckets[k] ||= []).push({ grade: r.grade, count: r.count });
					}

					// map into GraphQL shape
					const termLabels: Record<string, string> = {
						'10': 'Spring',
						'50': 'Summer',
						'80': 'Fall',
						'90': 'Winter',
					};

					return Object.entries(buckets).map(([tk, grp]) => {
						const [term, yearStr] = tk.split('-');
						const year = Number(yearStr);
						const total = grp.reduce((sum, g) => sum + g.count, 0);

						return {
							term: {
								code: term,
								description: termLabels[term] ?? 'Unknown',
							},
							year,
							distributions: grp.map((g) => ({
								grade: g.grade ?? 'N/A',
								count: g.count,
								percentage:
									total > 0
										? parseFloat(((g.count / total) * 100).toFixed(2))
										: 0,
							})),
						};
					});
				})
			);
		},
		{
			cacheKeyFn: (key) => key, // JSON string as the cache key
		}
	);
}