// src/graphql/middleware/requireRoles.ts
import { GraphQLError } from 'graphql'
import type { ApolloContext } from '@/middleware/apollo-server-context'

/**
 * Wraps a resolver so that only users with at least one of `allowedRoles`
 * may ever call it.
 */
export function requireRoles<
	TParent = any,
	TArgs = any,
	TResult = any
>(
	allowedRoles: string[],
	resolver: (
		parent: TParent,
		args: TArgs,
		ctx: ApolloContext
	) => Promise<TResult>
): (parent: TParent, args: TArgs, ctx: ApolloContext) => Promise<TResult> {
	return async (parent: TParent, args: TArgs, ctx: ApolloContext) => {

		// 3) Missing required role?
		if (!ctx.userContext.roles.some(r => allowedRoles.includes(r))) {
			throw new GraphQLError('Forbidden: insufficient permissions', {
				extensions: { code: 'FORBIDDEN' },
			})
		}

		// 4) All good—call the real resolver
		return resolver(parent, args, ctx)
	}
}
