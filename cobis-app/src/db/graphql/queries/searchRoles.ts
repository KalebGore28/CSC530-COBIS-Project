// src/graphql/queries/searchRoles.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { roles } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const RoleType = new GraphQLObjectType({
    name: 'Role',
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchRoles = {
    type: new GraphQLList(RoleType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(roles)
            .where(
                or(
                    sql`UPPER(${roles.id}) LIKE ${up + '%'}`,
                    sql`UPPER(${roles.name}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10);
    },
} 