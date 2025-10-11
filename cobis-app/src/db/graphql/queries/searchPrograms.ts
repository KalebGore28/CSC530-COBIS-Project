// src/graphql/queries/searchPrograms.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { programs } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const ProgramType = new GraphQLObjectType({
    name: 'Program',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchPrograms = {
    type: new GraphQLList(ProgramType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(programs)
            .where(
                or(
                    sql`UPPER(${programs.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${programs.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}