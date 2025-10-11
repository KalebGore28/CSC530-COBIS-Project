// src/graphql/queries/searchDepartments.ts
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'
import { sql, or } from 'drizzle-orm'
import { departments } from '@/db/schema'
import type { ApolloContext } from '@/middleware/apollo-server-context'

// Define return type (code + description)
export const DepartmentType = new GraphQLObjectType({
    name: 'Department',
    fields: {
        code: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        college: { type: GraphQLString },
    },
})

// Export GraphQL field config
export const searchDepartments = {
    type: new GraphQLList(DepartmentType),
    args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent: any, args: { query: string }, { db }: ApolloContext) => {
        const up = args.query.toUpperCase()
        return await db
            .select()
            .from(departments)
            .where(
                or(
                    sql`UPPER(${departments.code}) LIKE ${up + '%'}`,
                    sql`UPPER(${departments.description}) LIKE ${'%' + up + '%'}`
                )
            )
            .limit(10)
    },
}