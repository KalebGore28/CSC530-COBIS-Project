// File: src/graphql/context.ts
import DataLoader from 'dataloader'
import { getDbConnection } from '../db/connection'
import { inArray, sql } from 'drizzle-orm'
import * as schema from '../db/schema'

/**
 * Builds the GraphQL context, including Drizzle DB and DataLoader-based lookup loaders.
 */
export async function buildContext() {
	const { orm: db } = await getDbConnection()

	// Helper to create a DataLoader for any lookup table that has a 'code' column
	const makeLoader = (table: any) =>
		new DataLoader<string, any>(async (keys: readonly string[]) => {
			const rows = await db
				.select()
				.from(table)
				.where(inArray(table.code, keys as string[]))
			return keys.map((k) => rows.find((r: any) => r.code === k)!)
		})

	// Helper to create a DataLoader for composite keys
	const makeCompositeLoader = (table: any, keyFields: string[]) =>
		new DataLoader<string, any>(async (keys: readonly string[]) => {
			// Build SQL conditions per key: (table.f1 = v1 AND table.f2 = v2 ...)
			const conditions = keys.map((key) => {
				const parts = key.split('|')
				const ands = keyFields.map((f, i) => sql`${(table as any)[f]} = ${parts[i]}`)
				return ands.reduce((acc, cur) => sql`${acc} AND ${cur}`)
			})
			// Combine with OR
			const whereClause = conditions.reduce((acc, cur) => sql`${acc} OR ${cur}`)
			const rows = await db.select().from(table).where(whereClause)
			// Map back in order
			return keys.map((key) => {
				const parts = key.split('|')
				return rows.find((r: any) =>
					keyFields.every((f, i) =>
						r[f] === (f === 'number' ? Number(parts[i]) : parts[i])
					)
				)!
			})
		})

	const loaders = {
		user: makeLoader(schema.user),
		term: makeLoader(schema.terms),
		partOfTerm: makeLoader(schema.partOfTerm),
		registrationStatus: makeLoader(schema.registrationStatus),
		instructionalMethod: makeLoader(schema.instructionalMethods),
		admitCode: makeLoader(schema.admitCodes),
		academicStanding: makeLoader(schema.academicStanding),
		nation: makeLoader(schema.nations),
		program: makeLoader(schema.programs),
		department: makeLoader(schema.departments),
		college: makeLoader(schema.colleges),
		course: makeCompositeLoader(schema.courses, ['subject', 'number', 'suffix']),
		studentAcademicInfo: makeCompositeLoader(schema.studentAcademicInfo, ['mnumber', 'term', 'year']),
		student: makeLoader(schema.students),
	}

	return { db, loaders }
}
