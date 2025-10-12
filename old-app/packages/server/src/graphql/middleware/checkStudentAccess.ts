// src/graphql/utils/checkStudentAccess.ts
import { GraphQLError } from 'graphql';
import { eq, and, count } from 'drizzle-orm';
import * as tables from '../../db/schema';
import type { ApolloContext } from '../../app';

export function checkStudentAccess<
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
		if (ctx.roles.some(r => r.name === 'cobis_administrator')) {
			return resolver(parent, args, ctx);
		}

		// 3) advisor access to specific student
		const [{ cnt }] = await ctx.db
			.select({ cnt: count(tables.studentAdvisors.advisor_mnumber) })
			.from(tables.studentAdvisors)
			.where(
				and(
					eq(tables.studentAdvisors.student_mnumber, mnum),
					eq(tables.studentAdvisors.advisor_mnumber, ctx.mnumber || ''),
				)
			)

		if (cnt > 0) {
			return resolver(parent, args, ctx);
		}

		// 4) no access
		throw new GraphQLError(
			`You're not authorized to see detailed info for student ${mnum}`
		);
	};
}