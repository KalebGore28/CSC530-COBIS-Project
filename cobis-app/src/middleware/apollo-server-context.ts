import { createMiddleware } from '@tanstack/react-start'
import { getDbConnection, DbConnection } from '@/db'
import { createLoaders, Loaders } from '@/db/graphql/loaders'
import { auth } from '@/lib/server/auth'
import { loadUser } from './load-user'

export type ApolloContext = {
    db: DbConnection["orm"],
    loaders: Loaders,
    userContext: {
        session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"],
        user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"],
        roles: string[],
        mnumber: string | null,
        isEnabled: boolean,
        faculty: {
            firstName: string,
            lastName: string,
            department: string | null,
            college: string | null,
        }
    },
}

export const apolloServerContextMiddleware = createMiddleware({ type: 'request' })
    .middleware([loadUser])
    .server(async ({ next, context }) => {
        const { orm } = await getDbConnection()
        // Merge loaders into context before calling next
        const loaders = createLoaders(orm);
        // Extend context with loaders
        const extendedContext = { ...context, loaders, db: orm };
        return next({ context: extendedContext });

    })