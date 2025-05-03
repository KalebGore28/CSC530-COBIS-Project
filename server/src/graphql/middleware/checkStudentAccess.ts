// src/graphql/middleware/checkStudentAccess.ts
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { eq, and, count as sqlCount } from 'drizzle-orm'
import * as tables from '../../db/schema'

const studentIdSchema = z.string().regex(/^M\d{8}$/, 'Invalid M-number format')

/**
 * Wraps a resolver so it only runs if the user passes all of:
 * - authenticated,
 * - valid M-number,
 * - COBIS-admin OR own record OR advisee OR dept-chair in dept,
 * - student exists
 */
export function checkStudentAccess<
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

		const { mnumber } = args

		// 2) Validate M-number format
		const parsed = studentIdSchema.safeParse(mnumber)
		if (!parsed.success) {
			throw new GraphQLError(parsed.error.errors[0].message, {
				extensions: { code: 'BAD_USER_INPUT' },
			})
		}

		const roles: string[] = Array.isArray(ctx.roles) ? ctx.roles : []
		const hasRole = (r: string) => roles.includes(r)

		// 3) COBIS administrators see all
		if (hasRole('cobis_administrator')) {
			return resolver(parent, args, ctx, info)
		}

		// 4) Users see their own record
		if (ctx.mnumber === mnumber) {
			return resolver(parent, args, ctx, info)
		}

		// 5) Faculty/Advisor/ProgCoord/DeptChair/Admin can see advisees
		const facultyRoles = [
			'faculty',
			'advisor',
			'program_coordinator',
			'department_chair',
			'administrator',
		]
		if (facultyRoles.some(hasRole) && ctx.mnumber) {
			// run your isAdvisee logic _inline_
			const adviseeCount = await ctx.db
				.select({ cnt: sqlCount() })
				.from(tables.studentAdvisors)
				.where(
					and(
						eq(tables.studentAdvisors.student_mnumber, mnumber),
						eq(tables.studentAdvisors.advisor_mnumber, ctx.mnumber)
					)
				)
			if (Number(adviseeCount[0]?.cnt || 0) > 0) {
				return resolver(parent, args, ctx, info)
			}
		}

		// 6) Department chairs see students in their department
		if (hasRole('department_chair') && ctx.department) {
			const deptCount = await ctx.db
				.select({ cnt: sqlCount() })
				.from(tables.studentPrograms)
				.innerJoin(
					tables.programs,
					eq(tables.studentPrograms.program, tables.programs.code)
				)
				.where(
					and(
						eq(tables.studentPrograms.mnumber, mnumber),
						eq(tables.programs.department, ctx.department)
					)
				)
			if (Number(deptCount[0]?.cnt || 0) > 0) {
				return resolver(parent, args, ctx, info)
			}
		}

		// 7) If they don’t exist → 404
		const existsCount = await ctx.db
			.select({ cnt: sqlCount() })
			.from(tables.students)
			.where(eq(tables.students.mnumber, mnumber))
		if (Number(existsCount[0]?.cnt || 0) === 0) {
			throw new GraphQLError('Student not found', {
				extensions: { code: 'NOT_FOUND' },
			})
		}

		// 8) Otherwise → deny
		throw new GraphQLError('Access denied. Insufficient permissions.', {
			extensions: { code: 'FORBIDDEN' },
		})
	}
}
