import DataLoader from 'dataloader'
import { or, and, gt, lt, gte, lte, asc, eq } from 'drizzle-orm'
import { studentCourses } from '../../schema'
import type { DbConnection } from '../..'

type StudentCourse = typeof studentCourses.$inferSelect

/**
 * Instead of building one huge OR(...AND(...)...) expression,
 * this loader fetches all StudentCourse rows in the [startYear/startTerm .. endYear/endTerm]
 * range, then groups them by their composite key (subject|number|suffix) in JS.
 */
export function createStudentCoursesByTermLoader(
	db: DbConnection['orm'],
	startTerm: string,
	startYear: number,
	endTerm: string,
	endYear: number
) {
	return new DataLoader<string, StudentCourse[]>(async (compositeKeys) => {

		// 1. Build the same start/end range conditions:
		const startCond = or(
			gt(studentCourses.year, startYear),
			and(
				eq(studentCourses.year, startYear),
				gte(studentCourses.term, startTerm)
			)
		)
		const endCond = or(
			lt(studentCourses.year, endYear),
			and(
				eq(studentCourses.year, endYear),
				lte(studentCourses.term, endTerm)
			)
		)

		// 2. Fetch ALL studentCourses in that term/year window
		const rowsInRange: StudentCourse[] = await db
			.select()
			.from(studentCourses)
			.where(and(startCond, endCond))
			.orderBy(asc(studentCourses.year), asc(studentCourses.term))

		// 3. Build a Map<string, StudentCourse[]> keyed by "subject|number|suffix"
		const byCompositeKey = new Map<string, StudentCourse[]>()
		compositeKeys.forEach((key) => {
			byCompositeKey.set(key, [])
		})

		for (const row of rowsInRange) {
			// re-create the exact composite key that the resolver will use:
			const key = [row.course_subject, row.course_number, row.course_suffix].join('|')
			// if that key was requested in the batch, push into its bucket:
			if (byCompositeKey.has(key)) {
				byCompositeKey.get(key)!.push(row)
			}
			// if the key is not in byCompositeKey, just ignore this row
			// (i.e. no need to create a new bucket for it)
		}

		// 4. Return results in the same order as compositeKeys
		return compositeKeys.map((key) => byCompositeKey.get(key)!)
	})
}
