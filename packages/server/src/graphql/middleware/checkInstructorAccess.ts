// src/graphql/middleware/checkInstructorAccess.ts
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { eq, and, count as sqlCount } from 'drizzle-orm'
import * as tables from '../../db/schema'

const instructorIdSchema = z
	.string()
	.regex(/^[Mm]\d+$/i, 'Invalid M-number format')
	.transform((val) => val.toUpperCase())

/**
 * Wraps a resolver so it only runs if the user passes all of:
 * - authenticated,
 * - valid M-number,
 * - COBIS-admin OR own record OR dept-chair in dept,
 * - instructor exists
 */
export function checkInstructorAccess<
	P = any,
	A extends { mnumber: string } = { mnumber: string },
	C = any,
	R = any
>(
	resolver: (parent: P, args: A, ctx: C, info: any) => Promise<R> | R
) {
	return async (parent: P, args: A, ctx: any, info: any): Promise<R> => {
		// 1) Authenticated?
		if (!ctx.user) {
			throw new GraphQLError('Not authenticated', {
				extensions: { code: 'UNAUTHENTICATED' },
			})
		}

		// 2) Validate M-number format
		const parsed = instructorIdSchema.safeParse(args.mnumber)
		if (!parsed.success) {
			throw new GraphQLError(parsed.error.errors[0].message, {
				extensions: { code: 'BAD_USER_INPUT' },
			})
		}
		const mnum = parsed.data  // e.g. "M94325996"

		const roles: string[] = Array.isArray(ctx.roles) ? ctx.roles : []
		const hasRole = (r: string) => roles.includes(r)

		// 3) COBIS administrators see all
		if (hasRole('cobis_administrator')) {
			return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
		}

		// 4) Users see their own record
		if (ctx.mnumber === mnum) {
			return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
		}

		// 5) Department chairs see all instructors in their department
		if (hasRole('department_chair') && ctx.department) {
			const deptCount = await ctx.db
				.select({ cnt: sqlCount() })
				.from(tables.faculty)
				.where(
					and(
						eq(tables.faculty.mnumber, mnum),
						eq(tables.faculty.department, ctx.department)
					)
				)
			if (Number(deptCount[0]?.cnt || 0) > 0) {
				return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
			}
		}

		// 6) If they don’t exist → 404
		const existsCount = await ctx.db
			.select({ cnt: sqlCount() })
			.from(tables.faculty)
			.where(eq(tables.faculty.mnumber, mnum))
		if (Number(existsCount[0]?.cnt || 0) === 0) {
			throw new GraphQLError('Instructor not found', {
				extensions: { code: 'NOT_FOUND' },
			})
		}

		// 7) Otherwise → deny
		throw new GraphQLError('Access denied. Insufficient permissions.', {
			extensions: { code: 'FORBIDDEN' },
		})
	}
}
