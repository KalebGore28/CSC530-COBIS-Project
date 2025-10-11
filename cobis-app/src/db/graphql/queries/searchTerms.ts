// src/graphql/queries/searchTerms.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { terms } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const TermType = new GraphQLObjectType({
    name: 'Term',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchTerms = {
    type: new GraphQLList(TermType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(terms)
            .where(
                or(
                    sql`UPPER(${terms.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${terms.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}