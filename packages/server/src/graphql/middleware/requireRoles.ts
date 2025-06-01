// src/graphql/middleware/requireRoles.ts
import { GraphQLError } from 'graphql'

/**
 * Wraps a resolver so that only users with at least one of `allowedRoles`
 * may ever call it.
 */
export function requireRoles<R = any, A = any, C = any>(
	allowedRoles: string[],
	resolver: (parent: any, args: A, ctx: C, info: any) => Promise<R> | R
) {
	return async (parent: any, args: A, ctx: any, info: any): Promise<R> => {
		// 1) Not signed in?
		if (!ctx.user) {
			throw new GraphQLError('Not authenticated', {
				extensions: { code: 'UNAUTHENTICATED' },
			})
		}

		// 2) No roles on context?
		const userRoles: string[] = Array.isArray(ctx.roles)
			? ctx.roles
			: []

		// 3) Missing required role?
		if (!userRoles.some(r => allowedRoles.includes(r))) {
			throw new GraphQLError('Forbidden: insufficient permissions', {
				extensions: { code: 'FORBIDDEN' },
			})
		}

		// 4) All good—call the real resolver
		return resolver(parent, args, ctx, info)
	}
}
