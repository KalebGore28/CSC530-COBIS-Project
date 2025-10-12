// src/graphql/queries/searchColleges.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { colleges } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const CollegeType = new GraphQLObjectType({
    name: 'College',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
    },
})

// Export GraphQL field config
export const searchColleges = {
    type: new GraphQLList(CollegeType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(colleges)
            .where(
                or(
                    sql`UPPER(${colleges.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${colleges.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}