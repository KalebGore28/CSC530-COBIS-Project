import { GraphQLError } from 'graphql'
import type { ApolloContext } from '../../app';

// only checks enrollment access for department chairs, administrators, and COBIS admins

export function checkEnrollmentAccess<
	TParent = any,
	TArgs = any,
	TResult = any
>(
	resolver: (
		parent: TParent,
		args: TArgs,
		ctx: ApolloContext
	) => Promise<TResult>
): (parent: TParent, args: TArgs, ctx: ApolloContext) => Promise<TResult> {
	return async (parent: TParent, args: TArgs, ctx: ApolloContext) => {
		// 1) admin / super role
		if (ctx.roles.some(r => r.role_name === 'cobis_administrator')) {
			return resolver(parent, args, ctx);
		}

		// 2) Department chair check
		if (ctx.roles.some(r => r.role_name === 'department_chair')) {
			return resolver(parent, args, ctx);
		}

		// 3) Administrator check
		if (ctx.roles.some(r => r.role_name === 'administrator')) {
			return resolver(parent, args, ctx);
		}

		// 4) no access
		throw new GraphQLError('Access denied. Insufficient permissions.', {
			extensions: { code: 'FORBIDDEN' },
		});
	};
}