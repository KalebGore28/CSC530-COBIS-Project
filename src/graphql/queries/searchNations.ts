// src/graphql/queries/searchNations.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { nations } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const NationType = new GraphQLObjectType({
    name: 'Nation',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchNations = {
    type: new GraphQLList(NationType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(nations)
            .where(
                or(
                    sql`UPPER(${nations.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${nations.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}