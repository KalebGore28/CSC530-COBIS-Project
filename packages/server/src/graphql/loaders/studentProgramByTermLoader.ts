// utils/studentProgramsLoader.ts
import DataLoader from 'dataloader'
import { and, eq, gt, lt, gte, lte, asc, or, inArray } from 'drizzle-orm'
import type { StudentProgram } from '../../db/schema'
import { studentPrograms } from '../../db/schema'
import type { DbConnection } from '../../db/connection';

export function createStudentProgramsByTermLoader(
	db: DbConnection['orm'],
	startTerm: string,
	startYear: number,
	endTerm: string,
	endYear: number
) {
	return new DataLoader<string, StudentProgram[]>(async (programCodes) => {
		// Build the two boundary conditions once
		const startCond = or(
			gt(studentPrograms.year, startYear),
			and(
				eq(studentPrograms.year, startYear),
				gte(studentPrograms.term, startTerm)
			)
		)
		const endCond = or(
			lt(studentPrograms.year, endYear),
			and(
				eq(studentPrograms.year, endYear),
				lte(studentPrograms.term, endTerm)
			)
		)

		// One big batched query for all programCodes
		const rows = await db
			.select()
			.from(studentPrograms)
			.where(
				and(
					inArray(studentPrograms.program, [...programCodes]),
					startCond,
					endCond
				)
			)
			.orderBy(asc(studentPrograms.year), asc(studentPrograms.term))

		// Group by program
		const byProgram = new Map<string, StudentProgram[]>()
		programCodes.forEach((code) => byProgram.set(code, []))
		for (const row of rows) {
			byProgram.get(row.program)!.push(row)
		}

		return programCodes.map((code) => byProgram.get(code)!)
	})
}
