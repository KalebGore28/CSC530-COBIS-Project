import { GraphQLError } from 'graphql'
import { eq, and, count } from 'drizzle-orm';
import * as tables from '../../db/schema';
import type { ApolloContext } from '../../app';

export function checkInstructorAccess<
	TParent = any,
	TArgs extends { mnumber: string } = { mnumber: string },
	TResult = any
>(
	resolver: (
		parent: any,
		args: TArgs,
		ctx: ApolloContext
	) => Promise<TResult>
): (parent: any, args: TArgs, ctx: ApolloContext) => Promise<TResult> {
	return async (parent: TParent, args: TArgs, ctx: ApolloContext) => {
		const mnum = args.mnumber;

		// 1) self-access
		if (ctx.mnumber === mnum) {
			return resolver(parent, args, ctx);
		}

		// 2) admin / super role
		if (ctx.roles.some(r => r.role_name === 'cobis_administrator')) {
			return resolver(parent, args, ctx);
		}

		// 3) Department chair check
		if (ctx.roles.some(r => r.role_name === 'department_chair')) {
			// check and make sure the requested instructor is in the same department
			const [{ cnt }] = await ctx.db
				.select({ cnt: count(tables.faculty.mnumber) })
				.from(tables.faculty)
				.where(
					and(
						eq(tables.faculty.mnumber, mnum),
						eq(tables.faculty.department, ctx.department || ''),
					)
				)
			if (cnt > 0) {
				return resolver(parent, args, ctx);
			}
		}

		// 4) no access
		throw new GraphQLError('Access denied. Insufficient permissions.', {
			extensions: { code: 'FORBIDDEN' },
		})
	}
}
