import DataLoader from 'dataloader'
import { or, and, gt, lt, gte, lte, asc, eq } from 'drizzle-orm'
import { studentPrograms } from '../../schema'
import type { DbConnection } from '../..'

type StudentProgram = typeof studentPrograms.$inferSelect

/**
 * Load all StudentProgram rows between [startTerm/startYear … endTerm/endYear],
 * then group them by program in JavaScript.
 */
export function createStudentProgramsByTermLoader(
	db: DbConnection['orm'],
	startTerm: string,
	startYear: number,
	endTerm: string,
	endYear: number
) {
	return new DataLoader<string, StudentProgram[]>(async (programCodes) => {
		// 1. Build start/end term‐year conditions
		const startCond = or(
			gt(studentPrograms.year, startYear),
			and(
				eq(studentPrograms.year, startYear),
				gte(studentPrograms.term_code, startTerm)
			)
		)
		const endCond = or(
			lt(studentPrograms.year, endYear),
			and(
				eq(studentPrograms.year, endYear),
				lte(studentPrograms.term_code, endTerm)
			)
		)

		// 2. Fetch ALL rows in that term/year window in one query
		const rowsInRange: StudentProgram[] = await db
			.select()
			.from(studentPrograms)
			.where(and(startCond, endCond))
			.orderBy(asc(studentPrograms.year), asc(studentPrograms.term_code))

		// 3. Group by program code
		const byProgram = new Map<string, StudentProgram[]>()
		programCodes.forEach((code) => byProgram.set(code, []))
		for (const row of rowsInRange) {
			const key = row.program_code
			if (byProgram.has(key)) {
				byProgram.get(key)!.push(row)
			}
		}

		// 4. Return in the same order as programCodes
		return programCodes.map((code) => byProgram.get(code)!)
	})
}
