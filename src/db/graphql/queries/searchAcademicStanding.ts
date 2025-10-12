// src/graphql/queries/searchAcademicStandings.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { academicStanding } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const AcademicStandingType = new GraphQLObjectType({
    name: 'AcademicStanding',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchAcademicStandings = {
    type: new GraphQLList(AcademicStandingType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(academicStanding)
            .where(
                or(
                    sql`UPPER(${academicStanding.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${academicStanding.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}
