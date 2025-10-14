// src/graphql/queries/searchInstructionalMethods.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { instructionalMethods } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const InstructionalMethodType = new GraphQLObjectType({
    name: 'InstructionalMethod',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchInstructionalMethods = {
    type: new GraphQLList(InstructionalMethodType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(instructionalMethods)
            .where(
                or(
                    sql`UPPER(${instructionalMethods.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${instructionalMethods.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}