// src/graphql/middleware/checkStudentAccess.ts
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import { eq, and, count as sqlCount } from 'drizzle-orm'
import * as tables from '../../db/schema'

const studentIdSchema = z.string().regex(/^[Mm]\d+$/i, 'Invalid M-number format').transform((val) => val.toUpperCase())

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

		// pull out the uppercase M-number:
		const mnum = parsed.data   // e.g. "M94325996"

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
						eq(tables.studentAdvisors.student_mnumber, mnum),
						eq(tables.studentAdvisors.advisor_mnumber, ctx.mnumber)
					)
				)
			if (Number(adviseeCount[0]?.cnt || 0) > 0) {
				return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
			}
		}

		// 6) Instructors (faculty) see any student they’ve taught
		if (hasRole('faculty') && ctx.mnumber) {
			const taughtCount = await ctx.db
				.select({ cnt: sqlCount() })
				.from(tables.instructorCourses)
				.innerJoin(
					tables.studentCourses,
					and(
						// match the same course instance
						eq(tables.instructorCourses.term, tables.studentCourses.term),
						eq(tables.instructorCourses.year, tables.studentCourses.year),
						eq(tables.instructorCourses.crn, tables.studentCourses.crn),
						eq(
							tables.instructorCourses.course_subject,
							tables.studentCourses.course_subject
						),
						eq(
							tables.instructorCourses.course_number,
							tables.studentCourses.course_number
						),
						eq(
							tables.instructorCourses.course_suffix,
							tables.studentCourses.course_suffix
						),
						// only those this instructor taught
						eq(tables.instructorCourses.mnumber, ctx.mnumber),
						// only for this student
						eq(tables.studentCourses.mnumber, mnum)
					)
				)

			if (Number(taughtCount[0]?.cnt || 0) > 0) {
				return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
			}
		}

		// 7) Department chairs see any student who’s taken a course in their department
		if (hasRole('department_chair') && ctx.department) {
			const deptCount = await ctx.db
				.select({ cnt: sqlCount() })
				.from(tables.studentCourses)
				.innerJoin(
					tables.courses,
					and(
						eq(tables.studentCourses.course_subject, tables.courses.subject),
						eq(tables.studentCourses.course_number, tables.courses.number),
						eq(tables.studentCourses.course_suffix, tables.courses.suffix)
					)
				)
				.where(
					and(
						eq(tables.studentCourses.mnumber, mnum),
						eq(tables.courses.department, ctx.department)
					)
				)

			if (Number(deptCount[0]?.cnt || 0) > 0) {
				return resolver(parent, { ...args, mnumber: mnum }, ctx, info)
			}
		}

		// 7) If they don’t exist → 404
		const existsCount = await ctx.db
			.select({ cnt: sqlCount() })
			.from(tables.students)
			.where(eq(tables.students.mnumber, mnum))
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
