// src/graphql/queries/searchPartofTerms.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { partOfTerm } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const PartOfTermType = new GraphQLObjectType({
    name: 'PartOfTerm',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchPartOfTerms = {
    type: new GraphQLList(PartOfTermType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(partOfTerm)
            .where(
                or(
                    sql`UPPER(${partOfTerm.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${partOfTerm.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}
